/**
 * @packageDocumentation
 * @module Bot
 */

import { IBotContext } from "./typings/IBotContext";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

/**
 * replies user with plain text
 *
 * @param {string} text message context
 * @param {ExtraReplyMessage} extra optional message settings
 * @returns {Promise<void>} callback chain result
 */
export const textReplyMiddleware = (text: string, extra?: ExtraReplyMessage) =>
  (ctx: IBotContext): Promise<void> =>
    ctx.reply(text, extra).then(() =>
      Promise.resolve());
