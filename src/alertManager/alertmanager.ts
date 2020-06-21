/**
 * @packageDocumentation
 * @module AlertManager
 */

import { LevelGraph } from 'level-ts';
import { Alert } from './alert';
import level from 'level-ts';
import { CallbackData } from './interfaces';
import { encodeToString, decodeFromString } from './messagepack';
import { Telegram } from 'telegraf';
import { AlertManagerContext } from './context';
import { InlineKeyboardMarkup, InlineKeyboardButton } from "telegraf/typings/telegram-types";
import fetch, { FetchError } from 'node-fetch';

/** predicates used on the levelgraph database to link resources */
export const enum AlertManagerPredicates {
  /** `user-id` `chat-on` `chat-id` */
  ChatOn = "chat-on",
  /** `chat-id` `has-message` `message-id` */
  HasMessage = "has-message",
  /** `message-id` `alerts` `alert-hash` */
  Alerts = "alerts",
}

/**
 * materialization structure containing the full chain of ids for an alert
 * @category levelgraph
 * */
export interface AlertMessage {
  /** telegram API user ID */
  userId: string,
  /** telegram API chat ID */
  chatId: string,
  /** telegram API message ID */
  messageId: string,
  /** alert hash from [[Alert.hash]] */
  alertHash: string,
}

/**
 * @public
 */
export class AlertManager {
  private db: LevelGraph;
  private alerts: level<Alert>;
  private readonly silenceButtons: InlineKeyboardButton[];

  private static silenceCallbackData = (duration: string): string => encodeToString({
    module: "am",
    do: "silence",
    params: {
      time: duration
    }
  } as CallbackData);

  constructor(dbPath: string, alertDbPath: string) {
    this.db = new LevelGraph(dbPath);
    this.alerts = new level<Alert>(alertDbPath);
    this.silenceButtons = ["1h", "3h"]
    .map(time => ({
      text: `🤫 ${time}`, callback_data: AlertManager.silenceCallbackData(time)
    }));
  }

  firingMessageMarkup = (alert: Alert): InlineKeyboardMarkup => (
    {
      inline_keyboard: [
        [{ text: "🚨 Alerts", url: alert.relatedAlertsUrl }],
        this.silenceButtons,
        [{ text: "🤫 Custom Silence", url: alert.silenceUrl }]
      ]
    }
  );

  /** check whether a given user chat is already on state */
  async hasUserChat(userId: string, chatId: string): Promise<boolean> {
    return this.db
      .get({ subject: userId, predicate: AlertManagerPredicates.ChatOn, object: chatId })
      .then(result => result.length > 0);
  }

  /** adds a user chat to the state */
  async addUserChat(userId: string, chatId: string) {
    return this.db.put({
      subject: userId,
      predicate: AlertManagerPredicates.ChatOn,
      object: chatId
    });
  }

  /** links a message and the alert on the state */
  async addAlertMessage(chatId: string, messageId: string, alertHash: string) {
    return this.db.chain.put({
      subject: chatId,
      predicate: AlertManagerPredicates.HasMessage,
      object: messageId
    }).put({
      subject: messageId,
      predicate: AlertManagerPredicates.Alerts,
      object: alertHash
    }).finish();
  }

  /** fetches all messages that have been sent for the given alert */
  async getAlertMessages(alertHash: string): Promise<AlertMessage[]> {
    return this.db.walk({
      materialized: {
        userId: this.db.v("userId"),
        chatId: this.db.v("chatId"),
        messageId: this.db.v("messageId"),
        alertHash: this.db.v("alertId")
      } as AlertMessage,
      filter: (solution, callback) => callback(null, solution.alertId === alertHash && solution),
    },
      { subject: this.db.v("userId"), predicate: AlertManagerPredicates.ChatOn, object: this.db.v("chatId"), },
      { subject: this.db.v("chatId"), predicate: AlertManagerPredicates.HasMessage, object: this.db.v("messageId") },
      { subject: this.db.v("messageId"), predicate: AlertManagerPredicates.Alerts, object: this.db.v("alertId") },
    ) as Promise<AlertMessage[]>;
  }

  async getUnalertedChats(alertHash: string) {
    const chatIds = await this.getChats().then(chats => chats.map(chat => chat.object));

    return this.db.walk({
      materialized: {
      subject: this.db.v("userId"),
      predicate: AlertManagerPredicates.ChatOn,
      object: this.db.v("chatId")
      },
      filter: (solution, callback) => callback(null, solution.alertHash === alertHash && solution),
    },
      { subject: this.db.v("userId"), predicate: AlertManagerPredicates.ChatOn, object: this.db.v("chatId"), },
      { subject: this.db.v("chatId"), predicate: AlertManagerPredicates.HasMessage, object: this.db.v("messageId") },
      { subject: this.db.v("messageId"), predicate: AlertManagerPredicates.Alerts, object: this.db.v("alertHash") },
    ).then(entries => entries.map(entry => entry.object))
    .then(chats => chatIds.filter(chat => !chats.includes(chat)));
  }

  /** get the alert context for the given message */
  async getAlertFromMessage(messageId: string): Promise<AlertMessage> {
    return this.db.walk({
      materialized: {
        userId: this.db.v("userId"),
        chatId: this.db.v("chatId"),
        messageId: this.db.v("messageId"),
        alertHash: this.db.v("alertId")
      } as AlertMessage,
      filter: (solution, callback) => callback(null, solution.messageId === messageId && solution),
    },
      { subject: this.db.v("userId"), predicate: AlertManagerPredicates.ChatOn, object: this.db.v("chatId"), },
      { subject: this.db.v("chatId"), predicate: AlertManagerPredicates.HasMessage, object: this.db.v("messageId") },
      { subject: this.db.v("messageId"), predicate: AlertManagerPredicates.Alerts, object: this.db.v("alertId") },
    ).then(results => results[0])  as Promise<AlertMessage>;
  }

  /** get all current chats on state */
  async getChats() {
    return this.db.get({ predicate: AlertManagerPredicates.ChatOn });
  }

  /** stores an alert on state */
  async addAlert(alert: Alert) {
    return this.alerts.put(alert.hash, alert);
  }

  async delAlert(alertHash: string) {
    return this.alerts.del(alertHash);
  }

  async getAlert(alertHash: string) {
    return this.alerts.get(alertHash);
  }

  async sendAlertMessages(alert: Alert, telegram: Telegram) {
    if (alert.isFiring) {
      // if firing, we probably have a new alert
      this.addAlert(alert);

      // get chats that haven't received this alert
      const chatIds = await this.getUnalertedChats(alert.hash);

      return chatIds.forEach(chatId => telegram.sendMessage(chatId, alert.text, {
        parse_mode: "HTML",
        reply_markup: this.firingMessageMarkup(alert),
      }).then(message => this.addAlertMessage(chatId.toString(), message.message_id.toString(), alert.hash)));
    } else {
      // remove an existing alert as it is resolved
      this.delAlert(alert.hash);
      // cycle all chats to update the message, or send a new one if the user
      // hasn't received one previously
      const alerts = await this.getAlertMessages(alert.hash);
      return alerts.forEach(entry => {
        telegram.editMessageText(entry.chatId, parseInt(entry.messageId), undefined, alert.text, {
          parse_mode: 'HTML',
          reply_markup: undefined,
        });
      });
    }
  }

  /** silence an alert */
  async silenceAlert(alert: Alert, time: string, username: string, comment?: string) {
    const hours = parseInt(time);
    const startAt = new Date(Date.now());
    const endsAt = new Date(startAt.getTime() + (hours*60*60*1000));
    const callbackBaseUrl = process.env.INTERNAL_URL
      ? new URL(process.env.INTERNAL_URL)
      : alert.baseUrl;

    const silenceRequestBody = {
      matchers: alert.matchers,
      startsAt: startAt.toISOString(),
      endsAt: endsAt.toISOString(),
      createdBy: username,
      comment: comment || "silenced from Telegram bot",
      id: null
    };

    return fetch(`${callbackBaseUrl}api/v2/silences`, {
      method: "POST",
      body: JSON.stringify(silenceRequestBody),
      headers: [["Content-Type", "application/json"]],
    });
  };

  async processCallback(ctx: AlertManagerContext, next: () => Promise<void>) {
    console.log("[AlertManager] decoding data...");
    // try to decode and use the callback data
    const decodedData = decodeFromString<CallbackData>(ctx.callbackQuery!.data!);

    // not our callback, move along
    console.log("[AlertManager] checking if it is AM callback data...");
    if (decodedData.module !== "am") return next();

    console.log("[AlertManager] fetching alert message...");
    const alertMessage = await this.getAlertFromMessage(ctx.callbackQuery!.message!.message_id.toString());

    console.log("[AlertManager] fetching alert...");
    const alert = await this.getAlert(alertMessage.alertHash);

    console.log("[AlertManager] checking which action is required...");
    switch (decodedData.do) {
      case "silence":
        try {
          console.log("[AlertManager] silencing alert...");
          const response = await this.silenceAlert(alert, decodedData.params.time, ctx.from!.username || "unknown");

          console.log(response);

          if (response.status !== 200) {
            return response.text().then(response => ctx.answerCbQuery(`error: ${response}`));
          }

          console.log("[AlertManager] extracting silence response...");
          const responseData = await response.json();

          console.log(responseData);

          console.log("[AlertManager] sending silence replies...");
          return Promise.all([
            ctx.answerCbQuery(`silenced alert TODO for ${decodedData.params.time}`),
            ctx.reply(`ok, I've silenced this alert for ${decodedData.params.time} - more info here ${alert.baseUrl}/#/silences/${responseData.silenceID}`, {
              reply_to_message_id: ctx.callbackQuery!.message!.message_id
            }),
          ]);
        } catch (error) {
          console.log("Error during silencing!");
          console.error(error);
          if (error instanceof FetchError && error.errno === "ECONNREFUSED") {
            ctx.answerCbQuery(`unable to contact alertmanager - is it running and the URL set correctly?`);
            return next();
          } else {
            ctx.answerCbQuery(`unknown error while contacting alertmanager - check logs for details`);
            return next();
          }
        }
      default:
        return next();
    }
  }
}
