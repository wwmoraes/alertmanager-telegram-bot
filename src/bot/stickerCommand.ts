/**
 * @packageDocumentation
 * @module Bot
 */

import {BotContext} from "./BotContext";

export const stickerCommand = (ctx: BotContext): Promise<void> => {
  if (typeof ctx.message === "undefined") {
    return Promise.reject(new Error("undefined message on update"));
  }

  if (typeof ctx.message.sticker === "undefined") {
    return Promise.reject(new Error("undefined sticker on update"));
  }

  return ctx.reply(`Sticker file ID ${ctx.message.sticker.file_id} 👍`).then(() =>
    Promise.resolve());
};
