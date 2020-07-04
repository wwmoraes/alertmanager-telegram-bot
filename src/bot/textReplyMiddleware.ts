/**
 * @packageDocumentation
 * @module Bot
 */

import {IBotContext} from "./typings/IBotContext";
import {ExtraReplyMessage} from "telegraf/typings/telegram-types";

export const textReplyMiddleware = (text: string, extra?: ExtraReplyMessage) =>
  (ctx: IBotContext): Promise<void> =>
    ctx.reply(text, extra).then(() =>
      Promise.resolve());
