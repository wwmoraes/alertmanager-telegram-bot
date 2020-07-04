/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */

import {mock} from "jest-mock-extended";
import {Message} from "telegraf/typings/telegram-types";
import {stubUserTest} from "./stubUser";
import {stubChat} from "./stubChat";
import {stubSticker} from "./stubSticker";

export const stubMessageText = mock<Message>({
  message_id: 1,
  from: stubUserTest,
  chat: stubChat,
  text: "mock text message"
});

export const stubMessageSticker = mock<Message>({
  message_id: 2,
  from: stubUserTest,
  chat: stubChat,
  sticker: stubSticker
});

export default {
  stubMessageText,
  stubMessageSticker
};
