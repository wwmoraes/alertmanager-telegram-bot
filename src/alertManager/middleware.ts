import Telegraf, { Composer } from 'telegraf';
import { AlertManagerContext } from './context';
import { AlertManager } from './alertmanager';
import { Alert } from './alert';

export const AlertManagerMiddleware = new Composer<AlertManagerContext>();

AlertManagerMiddleware.use(async (ctx, next) => {
  // pass-through in case it is not an alertmanager update
  console.log("[AlertManager] checking if update has a known type...");
  if (ctx.updateType !== undefined) return next();

  try {
    console.log("[AlertManager] parsing alert update...");
    const alert = new Alert(ctx.update);
    console.log("[AlertManager] sending alert messages...");
    return ctx.alertManager.sendAlertMessages(alert, ctx.telegram);
  } catch (error) {
    console.error(error);
  }
});

AlertManagerMiddleware.on('callback_query', async (ctx, next) => {
  // no chat, move along
  console.log("[AlertManager] checking if the request came from a chat...");
  if (ctx.chat === undefined) return next();

  // no sender, move along
  console.log("[AlertManager] checking if the request has a user...");
  if (ctx.from === undefined) return next();

  // keep processing other middlewares
  console.log("[AlertManager] checking if the request a is callback...");
  if (ctx.callbackQuery === undefined) return next();

  console.log("[AlertManager] checking if callback has data...");
  if (ctx.callbackQuery.data === undefined) return next();

  console.log("[AlertManager] checking if callback has message...");
  if (ctx.callbackQuery.message === undefined) return next();

  console.log("[AlertManager] checking if callback message has from...");
  if (ctx.callbackQuery.message.from === undefined) return next();

  // debug log
  console.debug(`[AlertManager] callback user ID ${ctx.callbackQuery.from.id}`);
  console.debug(`[AlertManager] callback chat ID ${ctx.callbackQuery.chat_instance}`);
  console.debug(`[AlertManager] callback message ID ${ctx.callbackQuery.message?.message_id}`);

  console.debug('[AlertManager] processing callback...');
  return ctx.alertManager.processCallback(ctx, next);
});

export const setupAlertManagerContext = (bot: Telegraf<AlertManagerContext>) => {
  bot.context.alertManager = new AlertManager("data/alertmanager", "data/alerts");

  // reconnect admins
  console.log("getting admin chats...");
  bot.context.adminUserIds.forEach(adminUserId => {
    bot.telegram.getChat(adminUserId).then(chat => {
      console.log(`adding chatId ${chat.id} for user ${chat.username}`);
      return bot.context.alertManager.addUserChat(adminUserId, chat.id.toString());
    }).catch(console.error);
  });
};
