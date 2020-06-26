/**
 * @packageDocumentation
 * @module Bot
 */

import {BotContext} from "./BotContext";
import {ExtraReplyMessage} from "telegraf/typings/telegram-types";

export const textReplyMiddleware = (text: string, extra?: ExtraReplyMessage) =>
  (ctx: BotContext): Promise<void> =>
    ctx.reply(text, extra).then(() =>
      Promise.resolve());
