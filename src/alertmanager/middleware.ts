import Telegraf, { Composer } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';
import { encode, decode } from 'messagepack';
import { template } from 'dot';
import { readFileSync } from 'fs';
import level from 'level-ts';
import { LevelGraph } from 'level-ts';
import { createHash } from 'crypto';

import { BotContext, ChatEntry } from './context';
import { CallbackData, AlertUpdate } from './interfaces';

const templatePath = process.env.TEMPLATE_FILE || "default.tmpl";

const formatAlert = template(readFileSync(templatePath).toString());

const encodeToString = (obj: object): string =>
  String.fromCharCode(...Array.from(encode(obj)));

const decodeFromString = <T>(str: string): T =>
  decode<T>((new Uint8Array(str.split("").map(x => x.charCodeAt(0))).buffer));

export const Middleware = new Composer<BotContext>();

const silenceCallbackData = (duration: string): string => encodeToString({
  module: "am",
  do: "silence",
  params: {
    time: duration
  }
} as CallbackData);

const silenceOneOursCallbackData = silenceCallbackData("1h");
const silenceThreeOursCallbackData = silenceCallbackData("3h");

const firingMessageMarkup = (alertsUrl: string, silenceUrl: string): InlineKeyboardMarkup => (
  {
    inline_keyboard: [
      [{ text: "🚨 Alerts", url: alertsUrl }],
      [
        { text: "🤫 1h", callback_data: silenceOneOursCallbackData },
        { text: "🤫 3h", callback_data: silenceThreeOursCallbackData }
      ],
      [{ text: "🤫 Custom Silence", url: silenceUrl }]
    ]
  }
);

interface AlertManagerUrls {
  baseUrl: string,
  silenceUrl: string,
  relatedAlertsUrl: string,
}
const alertManagerUrls = (alert: AlertUpdate): AlertManagerUrls => {
  let baseUrl: string;
  // baseUrl = new URL("https://mon.artero.dev/graph").toString();

  if (alert.externalURL === undefined || alert.externalURL.indexOf('.') === -1)
    baseUrl = new URL("http://Williams-MacBook-Pro.local:9093").toString();
  else baseUrl = alert.externalURL;

  const silenceFilter = Object.keys(alert.commonLabels).map(key => `${key}="${alert.commonLabels[key]}"`).join(",");
  const silenceUrl = `${baseUrl}/#/silences/new?filter=${encodeURIComponent(`{${silenceFilter}}`)}`;
  const relatedAlertsUrl = `${baseUrl}/#/alerts?silenced=false&inhibited=false&active=true&filter=${encodeURIComponent(`{${silenceFilter}}`)}`;

  return {
    baseUrl,
    silenceUrl,
    relatedAlertsUrl,
  };
}

Middleware.use(async (ctx, next) => {
  // pass-through in case it is not an alertmanager update
  if (ctx.updateType !== undefined) {
    next();
    return;
  }

  const alert = (ctx.update as unknown) as AlertUpdate;
  const alertHash = createHash('md5').update(alert.groupKey).digest("hex");

  // format alert message
  const alertText = formatAlert(alert).replace(/\<br[ ]*\/?\>/g, "\r\n");

  if (alert.status === "firing") {
    // save a firing alert for future interactions
    ctx.alerts.put(alertHash, alert);

    const { baseUrl, silenceUrl, relatedAlertsUrl } = alertManagerUrls(alert);

    // cycle all chats to send the message, and store the message id afterwards
    ctx.chats.all().then(chats => {
      chats.forEach(entry => {
        ctx.telegram.sendMessage(entry.chatId, alertText, {
          parse_mode: "HTML",
          reply_markup: firingMessageMarkup(relatedAlertsUrl, silenceUrl)
        }).then(message => entry.messages?.push({
          messageId: message.message_id,
          alertHash
        }));
      });
    });
  }
  else {
    // remove an existing alert as it is resolved
    ctx.alerts.del(alertHash);
    // cycle all chats to update the message, or send a new one if the user had none previously
    ctx.chats.all().then(chats => {
      chats.forEach(entry => {
        entry.messages?.forEach(message => {
          ctx.telegram.editMessageText(entry.chatId, message.messageId, undefined, alertText, {
            parse_mode: 'HTML',
            reply_markup: undefined
          });
        });
      });
    });
  }
});

Middleware.on('callback_query', async (ctx, next) => {
  // no chat, move along
  console.log("[AlertManager] checking if the request came from a chat...");
  if (ctx.chat === undefined) { next(); return; }

  // keep processing other middlewares
  console.log("[AlertManager] checking if the request a is callback and if it has data...");
  if (ctx.callbackQuery === undefined || ctx.callbackQuery.data === undefined) { next(); return; }

  // get user chat and message
  // ctx.chats.get(ctx.callbackQuery.from.id.toString()).then(entry => {
  //   if (entry.chatId !== ctx.chat?.id)
  // }).catch(console.error);

  // try to decode and use the callback data
  console.log("[AlertManager] decoding data...");
  const data = decodeFromString<CallbackData>(ctx.callbackQuery.data);

  // not our callback, move along
  console.log("[AlertManager] checking if it is AM callback data...");
  if (data.module !== "am") { next(); return; }

  ctx.chats.get(ctx.from!.id.toString()).then(async entry => {
    if (entry.chatId === ctx.chat?.id && entry.messages !== undefined) {
      for(const message of entry.messages) {
        if (message.messageId === ctx.callbackQuery?.message?.message_id) {

          const alert = await ctx.alerts.get(message.alertHash);

          const { baseUrl } = alertManagerUrls(alert);

          console.log("[AlertManager] checking which action is required...");
          switch (data.do) {
            case "silence":
              const hours = parseInt(data.params.time);
              const startAt = new Date(Date.now());
              let endsAt = startAt;
              endsAt.setTime(endsAt.getTime() + (hours*60*60*1000));
              ctx.alerts.get(data.params.alertHash).then(alert => {
                const matchers = Object.keys(alert.commonLabels).map(key => (
                  { name: key, value: alert.commonLabels[key], isRegex: false }
                ));

                const silenceRequestBody = {
                  matchers,
                  startsAt: startAt.toISOString(),
                  endsAt: endsAt.toISOString(),
                  createdBy: ctx.from?.username,
                  comment: "silenced from Telegram bot",
                  id: null
                };

                fetch(`${baseUrl}/api/v2/silences`, {
                  method: "POST",
                  body: JSON.stringify(silenceRequestBody),
                }).then(response => response.json()).then(responseData => {
                  ctx.answerCbQuery(`silenced alert TODO for ${data.params.time}`).catch(console.error);
                  ctx.reply(`ok, I've silenced alert TODO for ${data.params.time} - more info here ${baseUrl}/#/silences/${responseData.silenceID}`, {
                    reply_to_message_id: ctx.message?.message_id
                  }).catch(console.error);
                }).catch(console.error);
              });
              break;
            default:
              next();
              break;
          }

          break;
        }
      }
    } else {
      console.error(`no chat registered to respond the callback`);
    }
  });
});

export const setupContext = (bot: Telegraf<BotContext>) => {
  bot.context.chats = new level<ChatEntry>("data/chats");
  bot.context.alerts = new level<AlertUpdate>("data/alerts");
  bot.context.alertmanager = new LevelGraph("data/alertmanager");

  // reconnect admins
  console.log("getting admin chat...");
  bot.telegram.getChat(process.env.TELEGRAM_ADMIN!).then(chat => {
    console.log(`adding chatId ${chat.id} for user ${chat.username}`);
    bot.context.chats.put(process.env.TELEGRAM_ADMIN!, {
      chatId: chat.id,
    });
    bot.context.alertmanager.put({
      subject: process.env.TELEGRAM_ADMIN!,
      predicate: "chat-on",
      object: chat.id
    }).catch(console.error);
  }).catch(console.error);
};

export default {
  Middleware,
  setupContext
};
