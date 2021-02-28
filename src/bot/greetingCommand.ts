/**
 * @packageDocumentation
 * @module Bot
 */

import { textReplyMiddleware } from "./textReplyMiddleware";

export const greetingCommand = textReplyMiddleware("Hey there");
