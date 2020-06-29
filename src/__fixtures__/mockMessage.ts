/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */

import {mock} from "jest-mock-extended";
import {Message} from "telegraf/typings/telegram-types";
import {mockUserTest} from "./mockUser";
import {mockChatValid} from "./mockChat";
import {mockStickerValid} from "./mockSticker";

export const mockMessageText = mock<Message>({
  message_id: 1,
  from: mockUserTest,
  chat: mockChatValid,
  text: "mock text message"
});

export const mockMessageSticker = mock<Message>({
  message_id: 2,
  from: mockUserTest,
  chat: mockChatValid,
  sticker: mockStickerValid
});

export default {
  mockMessageText,
  mockMessageSticker
};
