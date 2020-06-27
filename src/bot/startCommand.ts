/**
 * @packageDocumentation
 * @module Bot
 */

import {BotContext} from "./BotContext";

export const startCommand = async (ctx: BotContext): Promise<void> => {
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
