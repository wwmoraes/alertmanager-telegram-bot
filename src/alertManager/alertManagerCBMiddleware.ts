/**
 * @packageDocumentation
 * @module AlertManager
 */
/* global console */

import type {IAlertManagerContext} from "./typings/IAlertManagerContext";
import type {MiddlewareFn} from "telegraf/typings/composer";

/**
 * Telegraf bot
 *
 * @external Telegraf
 * @see {@link https://telegraf.js.org/}
 */

/**
 * Telegraf next callback
 *
 * @callback Telegraf~next
 * @returns {Promise<void>} callback chain result
 */

/**
 * processes callback requests from inline keyboards
 *
 * @param {IAlertManagerContext} ctx alertmanager's context
 * @param {Telegraf~next} next continues middleware callback chain
 * @returns {Promise<void>} callback chain result
 */
export const alertManagerCBMiddleware: MiddlewareFn<IAlertManagerContext> =
(ctx: IAlertManagerContext, next): Promise<void> => {
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
  console.debug(`[AlertManager] callback message ID ${ctx.callbackQuery.message.message_id}`);

  console.debug("[AlertManager] processing callback...");

  return ctx.alertManager.processCallback(
    ctx,
    next
  );
};
