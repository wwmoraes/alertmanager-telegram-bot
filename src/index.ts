import { Telegraf } from 'telegraf';

import {
  AlertManagerContext,
  AlertManagerMiddleware,
  setupAlertManagerContext
} from './alertManager';
import { AdminOnlyContext, AdminOnlyMiddleware } from './adminOnly';

require('dotenv').config();

if (process.env.TELEGRAM_TOKEN === undefined) {
  console.error("TELEGRAM_TOKEN is undefined");
  process.exit(2);
}

if (process.env.TELEGRAM_ADMINS === undefined || process.env.TELEGRAM_ADMINS.length === 0) {
  console.error("TELEGRAM_ADMINS is undefined");
  process.exit(2);
}

interface BotContext extends AlertManagerContext, AdminOnlyContext {}

const bot = new Telegraf<BotContext>(process.env.TELEGRAM_TOKEN, {
  telegram: {
    webhookReply: false
  }
});

bot.context.adminUserIds = process.env.TELEGRAM_ADMINS.split(',');

setupAlertManagerContext(bot);

bot.use(
  AdminOnlyMiddleware,
  AlertManagerMiddleware,
);

bot.start((ctx) => {
  if (!ctx.from || !ctx.chat) return;

  if (ctx.alertManager.hasUserChat(ctx.from.id.toString(), ctx.chat.id.toString())) {
    ctx.reply("y u do dis? You're already registered").catch(console.error);

    bot.telegram.getStickerSet("Meme_stickers")
    .then(stickerSet => stickerSet.stickers)
    .then(stickers => stickers.filter(sticker => sticker.emoji && ['🤦‍♂️', '🤦‍♀️'].includes(sticker.emoji)))
    .then(stickers => stickers[Math.round(Math.random()*(stickers.length-1))])
    .then(sticker => ctx.replyWithSticker(sticker.file_id));
    return;
  }

  ctx.alertManager.addUserChat(ctx.from.id.toString(), ctx.chat.id.toString());
  ctx.reply('Welcome!').catch(console.error);
});
bot.help((ctx) => ctx.reply('Send me a sticker').catch(console.error));
bot.on('sticker', (ctx) => ctx.reply(`Sticker file ID ${ctx.update.message?.sticker?.file_id} 👍`).catch(console.error));
bot.hears('hi', (ctx) => ctx.reply('Hey there').catch(console.error));

// bot.on('inline_query', (ctx) => {
//   console.log("inline query");
//   ctx.answerInlineQuery([]).catch(console.error);
// });

console.log("starting webhook on :8443...");
bot.startWebhook('/', null, 8443);
