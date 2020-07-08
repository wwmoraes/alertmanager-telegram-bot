/**
 * @packageDocumentation
 * @module UserOnly
 */

import {IUserOnlyContext} from "./typings/IUserOnlyContext";
import {MiddlewareFn} from "telegraf/typings/composer";

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
 * Only allows messages from the [provided user IDs]{@link IUserOnlyContext.userIds}
 *
 * @param {IUserOnlyContext} ctx bot context
 * @param {Telegraf~next} next continues middleware callback chain
 * @returns {Promise<void>} callback chain result
 */
export const userOnlyMiddleware: MiddlewareFn<IUserOnlyContext> =
  (ctx: IUserOnlyContext, next) => {
    // Not a known update type i.e. probably a webhook call
    if (typeof ctx.updateType === "undefined") {
      return next();
    }

    // Drop without sender
    if (typeof ctx.from === "undefined") {
      return Promise.resolve();
    }

    // Drop non-admin
    if (!ctx.userIds.includes(ctx.from.id.toString())) {
      return Promise.resolve();
    }

    return next();
  };

export default userOnlyMiddleware;
