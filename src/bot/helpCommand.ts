/**
 * @packageDocumentation
 * @module Bot
 */

import {BotContext} from "./BotContext";

export const helpCommand = (ctx: BotContext): Promise<void> =>
  ctx.reply("Send me a sticker").then(() =>
    Promise.resolve());
