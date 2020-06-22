/**
 * Sample bot using the [[AlertManager]] and [[UserOnly]] modules.
 * @packageDocumentation
 * @module Bot
 */

import {
  userOnlyMiddleware
} from "./userOnly";
import {
  alertManagerComposer,
  setupAlertManagerContext
} from "./alertManager";

import {Telegraf} from "telegraf";
import fetch from "node-fetch";

import config from "./config";
import {BotContext} from "./BotContext";

/**
 * Bot instance
 */
const bot = new Telegraf<BotContext>(
  config.telegramToken,
  {
    telegram: {
      webhookReply: false
    }
  }
);

bot.context.userIds = config.telegramAdmins.split(",");

setupAlertManagerContext(bot);

bot.use(
  userOnlyMiddleware,
  alertManagerComposer
);

bot.start((ctx) => {
  if (!ctx.from || !ctx.chat) {
    return;
  }

  if (ctx.alertManager.hasUserChat(
    ctx.from.id.toString(),
    ctx.chat.id.toString()
  )) {
    ctx.reply("y u do dis? You're already registered").catch(console.error);

    bot.telegram.getStickerSet("Meme_stickers").
      then((stickerSet) =>
        stickerSet.stickers).
      then((stickers) =>
        stickers.filter((sticker) =>
          sticker.emoji && [
            "🤦‍♂️",
            "🤦‍♀️"
          ].includes(sticker.emoji))).
      then((stickers) =>
        stickers[Math.round(Math.random() * (stickers.length - 1))]).
      then((sticker) =>
        ctx.replyWithSticker(sticker.file_id));

    return;
  }

  ctx.alertManager.addUserChat(
    ctx.from.id.toString(),
    ctx.chat.id.toString()
  );
  ctx.reply("Welcome!").catch(console.error);
});
bot.help((ctx) =>
  ctx.reply("Send me a sticker").catch(console.error));
bot.on(
  "sticker",
  (ctx) =>
    ctx.reply(`Sticker file ID ${ctx.update.message?.sticker?.file_id} 👍`).catch(console.error)
);
bot.hears(
  "hi",
  (ctx) =>
    ctx.reply("Hey there").catch(console.error)
);

/*
 * Bot.on('inline_query', (ctx) => {
 *   console.log("inline query");
 *   ctx.answerInlineQuery([]).catch(console.error);
 * });
 */

console.info("starting webhook on :8443...");
bot.startWebhook(
  "/",
  null,
  config.port
);

if (typeof config.externalUrl !== "undefined") {
  console.info(`registering webhook on ${config.externalUrl}...`);
  fetch(`https://api.telegram.org/bot${config.telegramToken}/setWebhook?url=${config.externalUrl}`).
    then(
      (response) =>
        console.info(response.status === 200
          ? "webhook set successfully"
          : "error setting the wehbook")
      , console.error
    );
}
