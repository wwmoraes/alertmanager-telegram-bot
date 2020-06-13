import { Telegraf } from 'telegraf';

import { BotContext } from './alertmanager/context';
import alertmanager from './alertmanager/middleware';
import { AdminOnlyMiddleware } from './middlewares';

require('dotenv').config();

if (process.env.TELEGRAM_TOKEN === undefined) {
  console.error("TELEGRAM_TOKEN is undefined");
  process.exit(2);
}

if (process.env.TELEGRAM_ADMIN === undefined) {
  console.error("TELEGRAM_ADMIN is undefined");
  process.exit(2);
}

const bot = new Telegraf<BotContext>(process.env.TELEGRAM_TOKEN!, {
  telegram: {
    webhookReply: false
  }
});

alertmanager.setupContext(bot);

bot.use(
  alertmanager.Middleware,
  AdminOnlyMiddleware,
);

bot.start((ctx) => {
  if (ctx.from && ctx.chat) {
    const chatId = ctx.chats.get(ctx.from.id.toString());

    if (chatId === undefined) {
      ctx.chats.put(ctx.from.id.toString(), {
        chatId: ctx.chat.id
      });
      ctx.reply('Welcome!').catch(console.error);
    } else {
      ctx.reply('BRO, y u do dis? You\'re already registered :facepalm:').catch(console.error);
    }
  } else {
    console.error("unknown start request", ctx);
  }
});
bot.help((ctx) => ctx.reply('Send me a sticker').catch(console.error));
bot.on('sticker', (ctx) => ctx.reply('👍').catch(console.error));
bot.hears('hi', (ctx) => ctx.reply('Hey there').catch(console.error));

bot.hears('test', (ctx) => {
  console.log("test heard");

  ctx.reply('Pick!', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "B1", callback_data: "B1" }
        ]
      ]
    }
  }).catch(console.error);
});

bot.on('callback_query', (ctx) => {
  console.log("callback query!");
  ctx.answerCbQuery(`received ${ctx.callbackQuery?.data}`).catch(console.error);
  ctx.reply("DONE BRO").catch(console.error);
});

// bot.on('inline_query', (ctx) => {
//   console.log("inline query");
//   ctx.answerInlineQuery([]).catch(console.error);
// });

console.log("starting webhook on :8443...");
bot.startWebhook('/', null, 8443);
