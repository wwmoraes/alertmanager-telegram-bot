/**
 * @packageDocumentation
 * @module Bot
 */

import {BotContext} from "./BotContext";

export const greetingCommand = (ctx: BotContext): Promise<void> =>
  ctx.reply("Hey there").then(() =>
    Promise.resolve());
