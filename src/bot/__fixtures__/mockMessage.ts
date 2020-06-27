/* eslint-disable no-undefined */

import {mock} from "jest-mock-extended";
import {Message} from "telegraf/typings/telegram-types";
import {mockUserTest} from "./mockUser";
import {mockChatValid} from "./mockChat";
import {mockStickerValid} from "./mockSticker";

export const mockMessageText = mock<Message>({
  from: mockUserTest,
  chat: mockChatValid,
  text: "mock text message"
});

export const mockMessageSticker: typeof mockMessageText = {
  ...mockMessageText,
  sticker: mockStickerValid,
  text: undefined
};

export default {
  mockMessageText,
  mockMessageSticker
};
