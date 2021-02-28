/**
 * @packageDocumentation
 * @module AlertManager
 */
/* global console */

import type { IAlertManagerContext } from "./typings/IAlertManagerContext";
import { Alert } from "./Alert";
import type { MiddlewareFn } from "telegraf";

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
 * processes updates sent from AlertManager to the bot webhook
 *
 * @param {IAlertManagerContext} ctx bot context containing AlertManager instance
 * @param {Telegraf~next} next continues middleware callback chain
 * @returns {Promise<void>} callback chain result
 */
export const alertManagerMiddleware: MiddlewareFn<IAlertManagerContext> =
  (ctx: IAlertManagerContext, next): Promise<void> => {
    // Pass-through in case it is not an alertmanager update
    console.info("[AlertManager] checking if update has a known type...");
    if (typeof ctx.updateType !== "undefined") {
      return next();
    }

    try {
      console.info("[AlertManager] parsing alert update...");
      const alert = Alert.from(ctx.update);

      console.info("[AlertManager] sending alert messages...");

      return ctx.alertManager.sendAlertMessages(
        alert,
        ctx.telegram
      );
    } catch (error) {
      return Promise.reject(error);
    }
  };
