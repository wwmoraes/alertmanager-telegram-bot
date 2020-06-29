/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {Telegram, Context} from "telegraf";
import {mockUserTest} from "./mockUser";
import {mockChatValid} from "./mockChat";
import {mockMessageText} from "./mockMessage";
import {mockStickerSetValid} from "./mockStickerSet";

export const mockContextValid = mock<Context>({
  from: mockUserTest,
  chat: mockChatValid,
  reply: jest.fn(() =>
    Promise.resolve(mockMessageText)),
  telegram: mock<Telegram>({
    getStickerSet: jest.fn((_setName) =>
      Promise.resolve(mockStickerSetValid))
  }),
  message: mockMessageText
});

export default {
  mockContextValid
};
