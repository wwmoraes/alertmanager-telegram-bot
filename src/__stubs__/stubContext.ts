/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {Telegram, Context} from "telegraf";
import {stubUserTest} from "./stubUser";
import {stubChat} from "./stubChat";
import {stubMessageText} from "./stubMessage";
import {stubStickerSet} from "./stubStickerSet";

export const stubContext = mock<Context>({
  from: stubUserTest,
  chat: stubChat,
  reply: jest.fn(() =>
    Promise.resolve(stubMessageText)),
  telegram: mock<Telegram>({
    getStickerSet: jest.fn((_setName) =>
      Promise.resolve(stubStickerSet))
  }),
  message: stubMessageText
});

export default {
  stubContext
};
