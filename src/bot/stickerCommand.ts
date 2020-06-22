/**
 * @packageDocumentation
 * @module Bot
 */

import {BotContext} from "./BotContext";

export const stickerCommand = (ctx: BotContext): Promise<void> =>
  ctx.reply(`Sticker file ID ${ctx.update.message?.sticker?.file_id} 👍`).then(() =>
    Promise.resolve());
