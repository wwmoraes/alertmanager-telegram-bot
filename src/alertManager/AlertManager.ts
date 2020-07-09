/**
 * @module AlertManager
 * @packageDocumentation
 */

import {Telegram} from "telegraf";
import Level, {LevelGraph} from "level-ts";
import type {ITriple} from "level-ts/dist/LevelGraph";
import fetch, {Response} from "node-fetch";
import type {AbstractLevelDOWN, AbstractIterator} from "abstract-leveldown";
import levelUpConstructor, {LevelUp} from "levelup";
import encode from "encoding-down";
import memdown from "memdown";

import {
  InlineKeyboardButton,
  InlineKeyboardMarkup
} from "telegraf/typings/telegram-types";

import type {IAlertManagerContext} from "./typings/IAlertManagerContext";
import {ICallbackData} from "./typings/ICallbackData";
import {decodeFromString, encodeToString} from "./messagepack";
import * as config from "./config";
import {IAlertMessage} from "./typings/IAlertMessage";
import {IAlertManagerPredicates} from "./typings/IAlertManagerPredicates";
import type {IAlert} from "./typings/IAlert";
import {mkdirSync} from "fs";

/**
 * Telegraf bot
 *
 * @external Telegraf
 * @see {@link https://telegraf.js.org/}
 */

/**
 * Telegraf id
 *
 * @typedef {string|number} Telegraf~id
 */

/**
 * @callback walkCallback
 * @template T
 * @param {string|null} error error message
 * @param {T} solution object with materialized keys
 * @returns {void}
 * */
type walkCallback<T> = (error: string|null, solution?: T) => void;

/**
 * @callback walkFilter
 * @template T
 * @param {T} solution object with materialized keys
 * @param {walkCallback} callback callback
 * @returns {void} nothing
 * */
type walkFilter<T> = (solution: T, callback: walkCallback<T>) => void;

/** @typedef {string} BaseDBKey */
type BaseDBKey = string;

/** @typedef {string} BaseDBValue */
type BaseDBValue = string;

/** @typedef {AbstractLevelDOWN<BaseDBKey, BaseDBValue>} BaseDBLevelDown */
type BaseDBLevelDown = AbstractLevelDOWN<BaseDBKey, BaseDBValue>;

/** @typedef {AbstractIterator<string, string>} BaseDBLevelIterator */
type BaseDBLevelIterator = AbstractIterator<string, string>;

/** @typedef {LevelUp<BaseDBLevelDown, BaseDBLevelIterator>} BaseDBLevelUp */
type BaseDBLevelUp = LevelUp<BaseDBLevelDown, BaseDBLevelIterator>;

/** @typedef {string} AlertsDBKey */
type AlertsDBKey = string;

/** @typedef {IAlert} AlertsDBValue */
type AlertsDBValue = IAlert;

/** @typedef {AbstractLevelDOWN<AlertsDBKey, AlertsDBValue>} AlertsDBLevelDown */
type AlertsDBLevelDown = AbstractLevelDOWN<AlertsDBKey, AlertsDBValue>;

/** @typedef {AbstractIterator<string, string>} AlertsDBLevelIterator */
type AlertsDBLevelIterator = AbstractIterator<string, string>;

/** @typedef {LevelUp<AlertsDBLevelDown, AlertsDBLevelIterator>} AlertsDBLevelUp */
type AlertsDBLevelUp = LevelUp<AlertsDBLevelDown, AlertsDBLevelIterator>;

/**
 * Handles alert notifications and silence requests
 *
 * @class AlertManager
 */
export class AlertManager {
  private db: LevelGraph;

  private alerts: Level<AlertsDBValue>;

  private readonly silenceButtons: InlineKeyboardButton[];

  /**
   * generates callback data to silence an alert
   *
   * @private
   * @param {string} duration string representing time, e.g. 1h
   * @returns {string} data encoded as string
   */
  private static silenceCallbackData =
    (duration: string): string =>
      encodeToString({
        module: "am",
        "do": "silence",
        params: {
          time: duration
        }
      } as ICallbackData);

  /**
   * opens databases and initializes buttons
   *
   * @param {string|BaseDBLevelUp} baseDBPath path or [[LevelUp]] object to use
   * §as alertmanager database
   * @param {string|AlertsDBLevelUp} alertsDBPath path or [[LevelUp]] object to
   * use as alerts database
   * @returns {AlertManager} instance
   */
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
   *
   * @param {IAlert} alert alert to generate the markup for
   * @returns {InlineKeyboardMarkup} keyboard markup
   */
  private firingMessageMarkup (alert: IAlert): InlineKeyboardMarkup {
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
   *
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
   *
   * @param {string} userId telegram user ID
   * @param {string} chatId telegram chat ID
   * @returns {Promise<void>} void on success or throws error
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
   *
   * @param {string} chatId telegram chat ID
   * @param {string} messageId telegram message ID
   * @param {string} alertHash hash from [[IAlert.hash]]
   * @returns {Promise<void>} resolves if added successfully
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

  /**
   * get [[IAlertMessage]] list filtered by a given filter
   *
   * @param {walkFilter<IAlertMessage>} filter function to filter the results
   * @returns {Promise<IAlertMessage[]>} alert messages
   */
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
   *
   * @param {string} alertHash alert hash from [[IAlert.hash]]
   * @returns {Promise<IAlertMessage[]>} alert messages
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
   *
   * @param {IAlert.hash} alertHash alert hash to search for
   * @returns {Promise<Telegraf~id[]>} chats which didn't receive the alert
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
   *
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
   *
   * @returns {Promise<ITriple<string|number>[]>} chat entries
   */
  getChats (): Promise<ITriple<string|number>[]> {
    return this.db.get({predicate: IAlertManagerPredicates.ChatOn});
  }

  /**
   * Stores an alert
   *
   * @param {IAlert} alert the alert to store
   * @returns {Promise<IAlert>} the alert itself
   */
  addAlert (alert: IAlert): Promise<IAlert> {
    return this.alerts.put(
      alert.hash,
      alert
    );
  }

  /**
   * Deletes an alert
   *
   * @param {IAlert.hash} alertHash alert hash to delete
   * @returns {Promise<void>} nothing
   */
  delAlert (alertHash: string): Promise<void> {
    return this.alerts.del(alertHash);
  }

  /**
   * retrieves alert data from database by it's hash
   *
   * @param {string} alertHash alert hash from [[IAlert.hash]]
   * @returns {Promise<IAlert>} alert data
   */
  getAlert (alertHash: string): Promise<IAlert> {
    return this.alerts.get(alertHash);
  }

  /**
   * sends firing alert messages, or edits messages with resolved status
   *
   * @param {IAlert} alert alert data
   * @param {Telegram} telegram telegram object
   * @returns {Promise<void>} callback chain result
   */
  async sendAlertMessages (alert: IAlert, telegram: Telegram): Promise<void> {
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

    // resolved, so the alert is removed from DB
    this.delAlert(alert.hash);

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
   *
   * @param {IAlert} alert the alert to silence
   * @param {string} time period to silence the alert, e.g. "1h"
   * @param {string} username silence requester
   * @param {string} [comment] silence reason
   * @returns {Promise<Response>} request response
   */
  static silenceAlert (alert: IAlert, time: string, username?: string, comment?: string): Promise<Response> {
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
      createdBy: username || "unknown",
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
   * Parses a callback request if it is known
   *
   * @param {IAlertManagerContext} ctx bot context
   * @param {function(): Promise<void>} next middleware callback
   * @returns {Promise<void>} callback chain result
   */
  processCallback (ctx: IAlertManagerContext, next: () => Promise<void>): Promise<void> {
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

    console.info("[AlertManager] decoding data...");
    // Try to decode and use the callback data
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

  /**
   * silences alerts on alertmanager
   *
   * @param {IAlertManagerContext} ctx alertmanager context
   * @param {string} time silence period, e.g. 1h
   * @returns {Promise<void>} callback chain result
   */
  async processSilence (ctx: IAlertManagerContext, time: string): Promise<void> {
    if (typeof ctx.callbackQuery === "undefined") {
      return Promise.reject(new Error("no callback query"));
    }

    if (typeof ctx.callbackQuery.message === "undefined") {
      return Promise.reject(new Error("no message on callback"));
    }

    if (typeof ctx.from === "undefined") {
      return Promise.reject(new Error("no from on callback"));
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
      ctx.from.username
    );

    if (alertmanagerResponse.status !== 200) {
      return alertmanagerResponse.text().then((responseText) => {
        ctx.answerCbQuery(`error: ${responseText}`);

        return Promise.reject(new Error(responseText));
      });
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
