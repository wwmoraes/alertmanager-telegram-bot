/**
 * @packageDocumentation
 * @module Bot
 */

import { IBotContext } from "./typings/IBotContext";

/**
 * reply to a sticker message with it's file ID
 *
 * @param {IBotContext} ctx bot context
 * @returns {Promise<void>} callback chain result
 */
export const stickerCommand = (ctx: IBotContext): Promise<void> => {
  if (typeof ctx.message === "undefined") {
    return Promise.reject(new Error("undefined message on update"));
  }

  if (!("sticker" in ctx.message)) {
    return Promise.reject(new Error("undefined sticker on update"));
  }

  return ctx.reply(`Sticker file ID ${ctx.message.sticker.file_id} 👍`).then(() =>
    Promise.resolve());
};
