/**
 * @module AlertManager
 * @packageDocumentation
 */

import {Telegram} from "telegraf";
import Level, {LevelGraph} from "level-ts";
import type {ITriple} from "level-ts/dist/LevelGraph";
import fetch, {Response, FetchError} from "node-fetch";
import type {AbstractLevelDOWN, AbstractIterator} from "abstract-leveldown";
import levelUpConstructor, {LevelUp} from "levelup";
import encode from "encoding-down";
import memdown from "memdown";

import {
  InlineKeyboardButton,
  InlineKeyboardMarkup
} from "telegraf/typings/telegram-types";

import {Alert} from "./Alert";
import type {IAlertManagerContext} from "./typings/IAlertManagerContext";
import {ICallbackData} from "./typings/ICallbackData";
import {decodeFromString, encodeToString} from "./messagepack";
import * as config from "./config";
import {IAlertMessage} from "./typings/IAlertMessage";
import {IAlertManagerPredicates} from "./typings/IAlertManagerPredicates";
import type {IAlert} from "./typings/IAlert";
import {mkdirSync} from "fs";

type walkCallback<T> = (error: string|null, solution?: T) => void;
type walkFilter<T> = (solution: T, callback: walkCallback<T>) => void;

type BaseDBKey = string;
type BaseDBValue = string;
type BaseDBLevelDown = AbstractLevelDOWN<BaseDBKey, BaseDBValue>;
type BaseDBLevelIterator = AbstractIterator<string, string>;
type BaseDBLevelUp = LevelUp<BaseDBLevelDown, BaseDBLevelIterator>;

type AlertsDBKey = string;
type AlertsDBValue = IAlert;
type AlertsDBLevelDown = AbstractLevelDOWN<AlertsDBKey, AlertsDBValue>;
type AlertsDBLevelIterator = AbstractIterator<string, string>;
type AlertsDBLevelUp = LevelUp<AlertsDBLevelDown, AlertsDBLevelIterator>;

export class AlertManager {
  private db: LevelGraph;

  private alerts: Level<AlertsDBValue>;

  private readonly silenceButtons: InlineKeyboardButton[];

  private static silenceCallbackData =
    (duration: string): string =>
      encodeToString({
        module: "am",
        "do": "silence",
        params: {
          time: duration
        }
      } as ICallbackData);

  constructor (baseDBPath?: string|BaseDBLevelUp, alertsDBPath?: string|AlertsDBLevelUp) {
    if (typeof baseDBPath === "undefined") {
      this.db = new LevelGraph<BaseDBValue>(levelUpConstructor(encode(memdown<string, string>(), {
        valueEncoding: "string",
        keyEncoding: "string"
      })));
    } else if (typeof baseDBPath === "string") {
      mkdirSync(baseDBPath, {recursive: true});
      this.db = new LevelGraph<BaseDBValue>(baseDBPath);
    } else {
      this.db = new LevelGraph<BaseDBValue>(baseDBPath);
    }

    if (typeof alertsDBPath === "undefined") {
      this.alerts = new Level<AlertsDBValue>(levelUpConstructor(encode(memdown<string, IAlert>(), {
        valueEncoding: "string",
        keyEncoding: "json"
      })));
    } else if (typeof alertsDBPath === "string") {
      mkdirSync(alertsDBPath, {recursive: true});
      this.alerts = new Level<AlertsDBValue>(alertsDBPath);
    } else {
      this.alerts = new Level<AlertsDBValue>(alertsDBPath);
    }

    this.silenceButtons = [
      "1h",
      "3h"
    ].
      map((time) =>
        ({
          text: `🤫 ${time}`,
          callback_data: AlertManager.silenceCallbackData(time)
        }));
  }

  /**
   * Inline keyboard markup for an alert
   * @param {Alert.hash} alert alert to generate the markup for
   * @returns {InlineKeyboardMarkup} keyboard markup
   */
  private firingMessageMarkup (alert: Alert): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: "🚨 Alerts",
            url: alert.relatedAlertsUrl
          }
        ],
        this.silenceButtons,
        [
          {
            text: "🤫 Custom Silence",
            url: alert.silenceUrl
          }
        ]
      ]
    };
  }

  /**
   * Check whether a given user chat is already on state
   * @param {string} userId telegram user ID
   * @param {string} chatId telegram chat ID
   * @returns {Promise<boolean>} true if the chat exists on context state
   */
  async hasUserChat (userId: string, chatId: string): Promise<boolean> {
    const entries = await this.db.
      get({
        object: chatId,
        predicate: IAlertManagerPredicates.ChatOn,
        subject: userId
      });


    return Promise.resolve(entries.length > 0);
  }

  /**
   * Adds a user chat to the state
   * @param {string} userId telegram user ID
   * @param {string} chatId telegram chat ID
   * @return {Promise<void>} void on success or throws error
   */
  addUserChat (userId: string, chatId: string): Promise<void> {
    return this.db.put({
      subject: userId,
      predicate: IAlertManagerPredicates.ChatOn,
      object: chatId
    });
  }

  /**
   * Links a message and the alert on the state
   * @param {string} chatId telegram chat ID
   * @param {string} messageId telegram message ID
   * @param {string} alertHash hash from [[Alert.hash]]
   * @returns {Promise<IGetTriple<string | number>[]>} levelgraph entry
   */
  addAlertMessage (chatId: string, messageId: string, alertHash: string): Promise<void> {
    return this.db.chain.put({
      subject: chatId,
      predicate: IAlertManagerPredicates.HasMessage,
      object: messageId
    }).put({
      subject: messageId,
      predicate: IAlertManagerPredicates.Alerts,
      object: alertHash
    }).
      finish().
      then(() =>
        Promise.resolve());
  }

  getIdsFilteredBy (filter?: walkFilter<IAlertMessage>): Promise<IAlertMessage[]> {
    return this.db.walk(
      {
        materialized: <IAlertMessage>{
          userId: this.db.v("userId"),
          chatId: this.db.v("chatId"),
          messageId: this.db.v("messageId"),
          alertHash: this.db.v("alertHash")
        },
        filter
      },
      {subject: this.db.v("userId"),
        predicate: IAlertManagerPredicates.ChatOn,
        object: this.db.v("chatId")},
      {subject: this.db.v("chatId"),
        predicate: IAlertManagerPredicates.HasMessage,
        object: this.db.v("messageId")},
      {subject: this.db.v("messageId"),
        predicate: IAlertManagerPredicates.Alerts,
        object: this.db.v("alertHash")}
    ) as Promise<IAlertMessage[]>;
  }

  /**
   * Gets all messages that have been sent for the given alert
   * @param {string} alertHash alert hash from [[Alert.hash]]
   * @returns {Promise<IAlertMessage[]>} alert message
   */
  getMessagesByAlert (alertHash: string): Promise<IAlertMessage[]> {
    return this.getIdsFilteredBy((solution, callback) => {
      if (solution.alertHash === alertHash) {
        return callback(null, solution);
      }

      return callback(null);
    });
  }

  /**
   * Gets all chats which haven't received the given alert
   * @param {Alert.hash} alertHash alert hash to search for
   * @returns {Promise<(string|number)[]>} chats which didn't receive the alert
   */
  async getUnalertedChats (alertHash: string): Promise<(string|number)[]> {
    const chatIds = await this.getChats().
      then((chats) =>
        chats.map((chat) =>
          chat.object));

    return this.db.walk(
      {
        materialized: {
          subject: this.db.v("userId"),
          predicate: IAlertManagerPredicates.ChatOn,
          object: this.db.v("chatId")
        },
        filter: (solution, callback) =>
          callback(
            null,
            solution.alertHash === alertHash && solution
          )
      },
      {subject: this.db.v("userId"),
        predicate: IAlertManagerPredicates.ChatOn,
        object: this.db.v("chatId")},
      {subject: this.db.v("chatId"),
        predicate: IAlertManagerPredicates.HasMessage,
        object: this.db.v("messageId")},
      {subject: this.db.v("messageId"),
        predicate: IAlertManagerPredicates.Alerts,
        object: this.db.v("alertHash")}
    ).then((entries) =>
      entries.map((entry) =>
        entry.object)).
      then((chats) =>
        chatIds.filter((chat) =>
          !chats.includes(chat)));
  }

  /**
   * Get the alert context for the given message
   * @param {string} messageId telegram message ID
   * @returns {Promise<IAlertMessage|undefined>} alert context
   */
  getAlertFromMessage (messageId: string): Promise<IAlertMessage|undefined> {
    return this.getIdsFilteredBy((solution, callback) => {
      if (solution.messageId === messageId) {
        return callback(null, solution);
      }

      return callback(null);
    }).
      then((results) => {
        console.debug(results);

        return Promise.resolve(results.pop());
      });
  }

  /**
   * Get all current chats on state
   * @returns {Promise<ITriple<string|number>[]>} chat entries
   */
  getChats (): Promise<ITriple<string|number>[]> {
    return this.db.get({predicate: IAlertManagerPredicates.ChatOn});
  }

  /**
   * Stores an alert
   * @param {Alert} alert the alert to store
   * @returns {Promise<Alert>} the alert itself
   */
  addAlert (alert: IAlert): Promise<IAlert> {
    return this.alerts.put(
      alert.hash,
      alert
    );
  }

  /**
   * Deletes an alert
   * @param {Alert.hash} alertHash alert hash to delete
   * @returns {Promise<void>} nothing
   */
  delAlert (alertHash: string): Promise<void> {
    return this.alerts.del(alertHash);
  }

  getAlert (alertHash: string): Promise<IAlert> {
    return this.alerts.get(alertHash);
  }

  async sendAlertMessages (alert: Alert, telegram: Telegram): Promise<void> {
    if (alert.isFiring) {
      // If firing, we probably have a new alert
      console.info("adding alert to DB...");
      this.addAlert(alert);

      // Get chats that haven't received this alert
      console.info("getting unalerted chats...");
      const chats = await this.getUnalertedChats(alert.hash);

      console.info("sending telegram message...");
      const chatMessages = await Promise.all(chats.map((chatId) =>
        telegram.sendMessage(
          chatId,
          alert.text,
          {
            parse_mode: "HTML",
            reply_markup: this.firingMessageMarkup(alert)
          }
        )));

      console.info("adding alert messages to DB...");
      const alertMessages = chatMessages.map((message) =>
        this.addAlertMessage(
          message.chat.id.toString(),
          message.message_id.toString(),
          alert.hash
        ));

      console.info("returning alert message promise...");

      return Promise.all(alertMessages).then(() =>
        Promise.resolve());
    }

    /*
     * Cycle all chats to update the message, or send a new one if the user
     * Hasn't received one previously
     */
    console.info("processing messages to alert...");

    const alertedMessages = await this.getMessagesByAlert(alert.hash);

    const editedMessages = alertedMessages.map((message) => {
      console.info(`message exists on chat ${message.chatId} - editing message...`);

      return telegram.editMessageText(
        message.chatId,
        parseInt(message.messageId, 10),
        "",
        alert.text,
        {parse_mode: "HTML"}
      );
    });

    return Promise.all(editedMessages).then(() =>
      Promise.resolve());
  }

  /**
   * Silence an alert
   * @param {Alert} alert the alert to silence
   * @param {string} time period to silence the alert (e.g. "1h")
   * @param {string} username silence requester (shows on AlertManager)
   * @param {string} [comment] silence reason (shows on AlertManager)
   * @returns {Promise<Response>} request response from AlertManager
   */
  static silenceAlert (alert: Alert, time: string, username: string, comment?: string): Promise<Response> {
    const hoursInSeconds = parseInt(time, 10) * 60 * 60 * 1000;
    const startAt = new Date(Date.now());
    const endsAt = new Date(startAt.getTime() + hoursInSeconds);

    const callbackBaseUrl = config.internalUrl
      ? new URL(config.internalUrl)
      : alert.baseUrl;

    const silenceRequestBody = {
      matchers: alert.matchers,
      startsAt: startAt.toISOString(),
      endsAt: endsAt.toISOString(),
      createdBy: username,
      comment: comment || "silenced from Telegram bot",
      id: null
    };

    return fetch(
      `${callbackBaseUrl}api/v2/silences`,
      {
        method: "POST",
        body: JSON.stringify(silenceRequestBody),
        headers: [
          [
            "Content-Type",
            "application/json"
          ]
        ]
      }
    );
  }

  /**
   * Parses a callback
   * @param {IAlertManagerContext} ctx bot context
   * @param {function(): Promise<void>} next middleware callback
   * @returns {Promise<void>} nothing
   */
  processCallback (ctx: IAlertManagerContext, next: () => Promise<void>): Promise<void> {
    console.info("[AlertManager] decoding data...");
    // Try to decode and use the callback data
    if (typeof ctx.callbackQuery === "undefined") {
      return Promise.reject(new Error("no callback query"));
    }

    if (typeof ctx.callbackQuery.data === "undefined") {
      return Promise.reject(new Error("no callback data"));
    }

    // TODO remove this test as it is needed on the silence process method
    if (typeof ctx.callbackQuery.message === "undefined") {
      return Promise.reject(new Error("no message on callback"));
    }

    const decodedData = decodeFromString<ICallbackData>(ctx.callbackQuery.data);

    // Not our callback, move along
    console.info("[AlertManager] checking if it is AM callback data...");
    if (decodedData.module !== "am") {
      return next();
    }

    console.info("[AlertManager] checking which action is required...");
    switch (decodedData.do) {
    case "silence":
      return this.processSilence(ctx, decodedData.params.time);
    default:
      return Promise.reject(new Error("unknown callback action"));
    }
  }

  async processSilence (ctx: IAlertManagerContext, time: string): Promise<void> {
    if (typeof ctx.callbackQuery?.message === "undefined") {
      return Promise.reject(new Error("no message on callback"));
    }

    console.info("[AlertManager] fetching alert message...");
    const alertMessage = await this.getAlertFromMessage(ctx.callbackQuery.message.message_id.toString());

    if (typeof alertMessage === "undefined") {
      // TODO give a feedback to the user or fetch alert info from alertmanager
      return Promise.reject(new Error("message not found"));
    }

    console.info("[AlertManager] fetching alert...");
    const alert = await this.getAlert(alertMessage.alertHash);

    console.info("[AlertManager] silencing alert...");
    const alertmanagerResponse: Response = await AlertManager.silenceAlert(
      alert,
      time,
      ctx.from?.username || "unknown"
    );

    if (alertmanagerResponse.status !== 200) {
      return alertmanagerResponse.text().then((responseText) =>
        ctx.answerCbQuery(`error: ${responseText}`).
          then((value) => {
            const message = value
              ? "user got a visual alert"
              : "unable to alert user about this error";

            return Promise.reject(new Error(`${responseText} - ${message}`));
          }));
    }

    console.info("[AlertManager] extracting silence response...");
    const responseData = await alertmanagerResponse.json();

    console.info("[AlertManager] sending silence replies...");

    return Promise.all([
      ctx.answerCbQuery(`silenced alert TODO for ${time}`),
      ctx.reply(
        `ok, I've silenced this alert for ${time} - more info here ${alert.baseUrl}/#/silences/${responseData.silenceID}`,
        {
          reply_to_message_id: ctx.callbackQuery.message.message_id
        }
      )
    ]).then((_result): Promise<void> =>
      Promise.resolve());
  }
}
