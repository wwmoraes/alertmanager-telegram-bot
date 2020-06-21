/**
 * @packageDocumentation
 * @module AlertManager
 */

import Telegraf, {Composer} from "telegraf";
import {AlertManagerContext} from "./context";
import {AlertManager} from "./alertmanager";
import {Alert} from "./alert";

export const AlertManagerMiddleware = new Composer<AlertManagerContext>();

AlertManagerMiddleware.use((ctx: AlertManagerContext, next) => {
  // Pass-through in case it is not an alertmanager update
  console.info("[AlertManager] checking if update has a known type...");
  if (typeof ctx.updateType !== "undefined") {
    return next();
  }

  try {
    console.info("[AlertManager] parsing alert update...");
    const alert = new Alert(ctx.update);

    console.info("[AlertManager] sending alert messages...");

    return ctx.alertManager.sendAlertMessages(
      alert,
      ctx.telegram
    );
  } catch (error) {
    console.error(error);
  }

  return Promise.resolve();
});

AlertManagerMiddleware.on(
  "callback_query",
  (ctx: AlertManagerContext, next): Promise<void> => {
  // No chat, move along
    console.info("[AlertManager] checking if the request came from a chat...");
    if (typeof ctx.chat === "undefined") {
      return next();
    }

    // No sender, move along
    console.info("[AlertManager] checking if the request has a user...");
    if (typeof ctx.from === "undefined") {
      return next();
    }

    // Keep processing other middlewares
    console.info("[AlertManager] checking if the request a is callback...");
    if (typeof ctx.callbackQuery === "undefined") {
      return next();
    }

    console.info("[AlertManager] checking if callback has data...");
    if (typeof ctx.callbackQuery.data === "undefined") {
      return next();
    }

    console.info("[AlertManager] checking if callback has message...");
    if (typeof ctx.callbackQuery.message === "undefined") {
      return next();
    }

    console.info("[AlertManager] checking if callback message has from...");
    if (typeof ctx.callbackQuery.message.from === "undefined") {
      return next();
    }

    // Debug log
    console.debug(`[AlertManager] callback user ID ${ctx.callbackQuery.from.id}`);
    console.debug(`[AlertManager] callback chat ID ${ctx.callbackQuery.chat_instance}`);
    console.debug(`[AlertManager] callback message ID ${ctx.callbackQuery.message?.message_id}`);

    console.debug("[AlertManager] processing callback...");

    return ctx.alertManager.processCallback(
      ctx,
      next
    );
  }
);

export const setupAlertManagerContext =
  (bot: Telegraf<AlertManagerContext>): void => {
    bot.context.alertManager = new AlertManager(
      "data/alertmanager",
      "data/alerts"
    );

    // Reconnect admins
    console.info("getting admin chats...");
    bot.context.adminUserIds.forEach((adminUserId) => {
      bot.telegram.getChat(adminUserId).then((chat) => {
        console.info(`adding chatId ${chat.id} for user ${chat.username}`);

        return bot.context.alertManager.addUserChat(
          adminUserId,
          chat.id.toString()
        );
      }).
        catch(console.error);
    });
  };
