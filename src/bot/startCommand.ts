/**
 * @packageDocumentation
 * @module Bot
 */

import { IBotContext } from "./typings/IBotContext";

/**
 * adds the user to the alertmanager context to receive alert messages
 *
 * @param {IBotContext} ctx bot context
 * @returns {Promise<void>} callback chain result
 */
export const startCommand = async (ctx: IBotContext): Promise<void> => {
  if (!ctx.from) {
    return Promise.reject(new Error("no sender on the start request"));
  }
  if (!ctx.chat) {
    return Promise.reject(new Error("no chat on the start request"));
  }

  if (await ctx.alertManager.hasUserChat(
    ctx.from.id.toString(),
    ctx.chat.id.toString()
  )) {
    await ctx.reply("y u do dis? You're already registered");

    return ctx.telegram.getStickerSet("Meme_stickers").
      then((stickerSet) =>
        stickerSet.stickers).
      then((stickers) =>
        stickers.filter((sticker) =>
          sticker.emoji && [
            "🤦‍♂️",
            "🤦‍♀️"
          ].includes(sticker.emoji))).
      then((stickers) =>
        stickers[Math.round(Math.random() * (stickers.length - 1))]).
      then((sticker) =>
        ctx.replyWithSticker(sticker.file_id)).
      then(() =>
        Promise.resolve());
  }

  return ctx.alertManager.addUserChat(
    ctx.from.id.toString(),
    ctx.chat.id.toString()
  ).then(() =>
    ctx.reply("Welcome!")).
    then(() =>
      Promise.resolve());
};
