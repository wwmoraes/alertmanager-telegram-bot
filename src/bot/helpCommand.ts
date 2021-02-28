/**
 * @packageDocumentation
 * @module Bot
 */

import { textReplyMiddleware } from "./textReplyMiddleware";

export const helpCommand = textReplyMiddleware("Send me a sticker");
