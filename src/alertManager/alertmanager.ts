/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Telegram} from "telegraf";
import Level, {LevelGraph, IGetTriple, ITriple} from "level-ts";
import fetch, {FetchError, Response} from "node-fetch";

import {
  InlineKeyboardButton,
  InlineKeyboardMarkup
} from "telegraf/typings/telegram-types";

import {Alert} from "./alert";
import {AlertManagerContext} from "./context";
import {CallbackData} from "./interfaces";
import {decodeFromString, encodeToString} from "./messagepack";
import config from "./config";

/** Predicates used on the levelgraph database to link resources */
export const enum AlertManagerPredicates {

  /** `user-id` `chat-on` `chat-id` */
  ChatOn = "chat-on",

  /** `chat-id` `has-message` `message-id` */
  HasMessage = "has-message",

  /** `message-id` `alerts` `alert-hash` */
  Alerts = "alerts",
}

/**
 * Materialization structure containing the full chain of ids for an alert
 * @category levelgraph
 *
 */
export interface AlertMessage {

  /** Telegram API user ID */
  userId: string,

  /** Telegram API chat ID */
  chatId: string,

  /** Telegram API message ID */
  messageId: string,

  /** Alert hash from [[Alert.hash]] */
  alertHash: string,
}

export class AlertManager {
  private db: LevelGraph;

  private alerts: Level<Alert>;

  private readonly silenceButtons: InlineKeyboardButton[];

  private static silenceCallbackData =
    (duration: string): string =>
      encodeToString({
        "module": "am",
        "do": "silence",
        "params": {
          "time": duration
        }
      } as CallbackData);

  constructor (dbPath: string, alertDbPath: string) {
    this.db = new LevelGraph(dbPath);
    this.alerts = new Level<Alert>(alertDbPath);
    this.silenceButtons = [
      "1h",
      "3h"
    ].
      map((time) =>
        ({
          "text": `🤫 ${time}`,
          "callback_data": AlertManager.silenceCallbackData(time)
        }));
  }

  /**
   * Inline keyboard markup for an alert
   * @param {Alert.hash} alert alert to generate the markup for
   * @returns {InlineKeyboardMarkup} keyboard markup
   */
  private firingMessageMarkup (alert: Alert): InlineKeyboardMarkup {
    return {
      "inline_keyboard": [
        [
          {
            "text": "🚨 Alerts",
            "url": alert.relatedAlertsUrl
          }
        ],
        this.silenceButtons,
        [
          {
            "text": "🤫 Custom Silence",
            "url": alert.silenceUrl
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
  hasUserChat (userId: string, chatId: string): Promise<boolean> {
    return this.db.
      get({
        "object": chatId,
        "predicate": AlertManagerPredicates.ChatOn,
        "subject": userId
      }).then((result) =>
        result.length > 0);
  }

  /**
   * Adds a user chat to the state
   * @param {string} userId telegram user ID
   * @param {string} chatId telegram chat ID
   * @return {Promise<void>} void on success or throws error
   */
  addUserChat (userId: string, chatId: string): Promise<void> {
    return this.db.put({
      "subject": userId,
      "predicate": AlertManagerPredicates.ChatOn,
      "object": chatId
    });
  }

  /**
   * Links a message and the alert on the state
   * @param {string} chatId telegram chat ID
   * @param {string} messageId telegram message ID
   * @param {string} alertHash hash from [[Alert.hash]]
   * @returns {Promise<IGetTriple<string | number>[]>} levelgraph entry
   */
  addAlertMessage (chatId: string, messageId: string, alertHash: string): Promise<IGetTriple<string | number>[]> {
    return this.db.chain.put({
      "subject": chatId,
      "predicate": AlertManagerPredicates.HasMessage,
      "object": messageId
    }).put({
      "subject": messageId,
      "predicate": AlertManagerPredicates.Alerts,
      "object": alertHash
    }).
      finish();
  }

  /**
   * Gets all messages that have been sent for the given alert
   * @param {string} alertHash alert hash from [[Alert.hash]]
   * @returns {Promise<AlertMessage[]>} alert message
   */
  getAlertMessages (alertHash: string): Promise<AlertMessage[]> {
    return this.db.walk(
      {
        "materialized": {
          "userId": this.db.v("userId"),
          "chatId": this.db.v("chatId"),
          "messageId": this.db.v("messageId"),
          "alertHash": this.db.v("alertId")
        } as AlertMessage,
        "filter": (solution, callback) =>
          callback(
            null,
            solution.alertId === alertHash && solution
          )
      },
      {"subject": this.db.v("userId"),
        "predicate": AlertManagerPredicates.ChatOn,
        "object": this.db.v("chatId")},
      {"subject": this.db.v("chatId"),
        "predicate": AlertManagerPredicates.HasMessage,
        "object": this.db.v("messageId")},
      {"subject": this.db.v("messageId"),
        "predicate": AlertManagerPredicates.Alerts,
        "object": this.db.v("alertId")}
    ) as Promise<AlertMessage[]>;
  }

  /**
   * Gets all chats which haven't received the given alert
   * @param {Alert.hash} alertHash alert hash to search for
   * @returns {Promise<(string|number)[]>} chats which didn't receive the alert
   */
  async getUnalertedChats (alertHash: string): Promise<(string|number)[]> {
    const chatIds = await this.getChats().then((chats) =>
      chats.map((chat) =>
        chat.object));

    return this.db.walk(
      {
        "materialized": {
          "subject": this.db.v("userId"),
          "predicate": AlertManagerPredicates.ChatOn,
          "object": this.db.v("chatId")
        },
        "filter": (solution, callback) =>
          callback(
            null,
            solution.alertHash === alertHash && solution
          )
      },
      {"subject": this.db.v("userId"),
        "predicate": AlertManagerPredicates.ChatOn,
        "object": this.db.v("chatId")},
      {"subject": this.db.v("chatId"),
        "predicate": AlertManagerPredicates.HasMessage,
        "object": this.db.v("messageId")},
      {"subject": this.db.v("messageId"),
        "predicate": AlertManagerPredicates.Alerts,
        "object": this.db.v("alertHash")}
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
   * @returns {Promise<AlertMessage>} alert context
   */
  getAlertFromMessage (messageId: string): Promise<AlertMessage> {
    return this.db.walk(
      {
        "materialized": {
          "userId": this.db.v("userId"),
          "chatId": this.db.v("chatId"),
          "messageId": this.db.v("messageId"),
          "alertHash": this.db.v("alertId")
        } as AlertMessage,
        "filter": (solution, callback) =>
          callback(
            null,
            solution.messageId === messageId && solution
          )
      },
      {"subject": this.db.v("userId"),
        "predicate": AlertManagerPredicates.ChatOn,
        "object": this.db.v("chatId")},
      {"subject": this.db.v("chatId"),
        "predicate": AlertManagerPredicates.HasMessage,
        "object": this.db.v("messageId")},
      {"subject": this.db.v("messageId"),
        "predicate": AlertManagerPredicates.Alerts,
        "object": this.db.v("alertId")}
    ).then((results) =>
      results[0]) as Promise<AlertMessage>;
  }

  /**
   * Get all current chats on state
   * @returns {Promise<ITriple<string|number>[]>} chat entries
   */
  getChats (): Promise<ITriple<string|number>[]> {
    return this.db.get({"predicate": AlertManagerPredicates.ChatOn});
  }

  /**
   * Stores an alert
   * @param {Alert} alert the alert to store
   * @returns {Promise<Alert>} the alert itself
   */
  addAlert (alert: Alert): Promise<Alert> {
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

  getAlert (alertHash: string): Promise<Alert> {
    return this.alerts.get(alertHash);
  }

  async sendAlertMessages (alert: Alert, telegram: Telegram): Promise<void> {
    if (alert.isFiring) {
      // If firing, we probably have a new alert
      this.addAlert(alert);

      // Get chats that haven't received this alert
      const chatIds = await this.getUnalertedChats(alert.hash);

      return chatIds.forEach((chatId) =>
        telegram.sendMessage(
          chatId,
          alert.text,
          {
            "parse_mode": "HTML",
            "reply_markup": this.firingMessageMarkup(alert)
          }
        ).then((message) =>
          this.addAlertMessage(
            chatId.toString(),
            message.message_id.toString(),
            alert.hash
          )));
    }
    // Remove an existing alert as it is resolved
    this.delAlert(alert.hash);

    /*
     * Cycle all chats to update the message, or send a new one if the user
     * Hasn't received one previously
     */
    const alerts = await this.getAlertMessages(alert.hash);


    return alerts.forEach((entry) => {
      telegram.editMessageText(
        entry.chatId,
        parseInt(entry.messageId, 10),
        "",
        alert.text,
        {"parse_mode": "HTML"}
      );
    });
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
      "matchers": alert.matchers,
      "startsAt": startAt.toISOString(),
      "endsAt": endsAt.toISOString(),
      "createdBy": username,
      "comment": comment || "silenced from Telegram bot",
      "id": null
    };

    return fetch(
      `${callbackBaseUrl}api/v2/silences`,
      {
        "method": "POST",
        "body": JSON.stringify(silenceRequestBody),
        "headers": [
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
   * @param {AlertManagerContext} ctx bot context
   * @param {function(): Promise<void>} next middleware callback
   * @returns {Promise<void>} nothing
   */
  async processCallback (ctx: AlertManagerContext, next: () => Promise<void>): Promise<void> {
    console.info("[AlertManager] decoding data...");
    // Try to decode and use the callback data
    if (typeof ctx.callbackQuery === "undefined") {
      throw new Error("no callback query");
    }

    if (typeof ctx.callbackQuery.data === "undefined") {
      throw new Error("no callback data");
    }

    if (typeof ctx.callbackQuery.message === "undefined") {
      throw new Error("no message on callback");
    }

    const decodedData = decodeFromString<CallbackData>(ctx.callbackQuery.data);

    // Not our callback, move along
    console.info("[AlertManager] checking if it is AM callback data...");
    if (decodedData.module !== "am") {
      return next();
    }

    console.info("[AlertManager] fetching alert message...");
    const alertMessage = await this.getAlertFromMessage(ctx.callbackQuery.message.message_id.toString());

    console.info("[AlertManager] fetching alert...");
    const alert = await this.getAlert(alertMessage.alertHash);

    console.info("[AlertManager] checking which action is required...");
    switch (decodedData.do) {
    case "silence":
      try {
        console.info("[AlertManager] silencing alert...");
        const alertmanagerResponse: Response = await AlertManager.silenceAlert(
          alert,
          decodedData.params.time,
          ctx.from?.username || "unknown"
        );

        console.info(alertmanagerResponse);

        if (alertmanagerResponse.status !== 200) {
          return alertmanagerResponse.text().then((responseText) =>
            ctx.answerCbQuery(`error: ${responseText}`)).
            then((value) => {
              if (value) {
                Promise.resolve();
              } else {
                Promise.reject(new Error("unable to answer callback"));
              }
            });
        }

        console.info("[AlertManager] extracting silence response...");
        const responseData = await alertmanagerResponse.json();

        console.info(responseData);

        console.info("[AlertManager] sending silence replies...");

        return Promise.all([
          ctx.answerCbQuery(`silenced alert TODO for ${decodedData.params.time}`),
          ctx.reply(
            `ok, I've silenced this alert for ${decodedData.params.time} - more info here ${alert.baseUrl}/#/silences/${responseData.silenceID}`,
            {
              "reply_to_message_id": ctx.callbackQuery?.message?.message_id
            }
          )
        ]).then((_result): Promise<void> =>
          Promise.resolve());
      } catch (error) {
        console.error("Error during silencing!");
        console.error(error);
        if (error instanceof FetchError && error.errno === "ECONNREFUSED") {
          ctx.answerCbQuery("unable to contact alertmanager - is it running and the URL set correctly?");

          return next();
        }
        ctx.answerCbQuery("unknown error while contacting alertmanager - check logs for details");

        return next();
      }
    default:
      return next();
    }
  }
}
