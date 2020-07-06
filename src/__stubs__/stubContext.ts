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
import {ExtraEditMessage, Message} from "telegraf/typings/telegram-types";

export const stubContext = mock<Context>({
  from: stubUserTest,
  chat: stubChat,
  reply: jest.fn(() =>
    Promise.resolve(stubMessageText)),
  telegram: new Telegram("TELEGRAM_TOKEN", {
    apiRoot: "https://api.telegram.localhost",
    webhookReply: false
  }),
  message: stubMessageText
});

jest.spyOn(stubContext.telegram, "getStickerSet").mockImplementation((_setName) =>
  Promise.resolve(stubStickerSet));
jest.spyOn(stubContext.telegram, "sendMessage").mockImplementation((chatId: string|number, text: string, extra?: ExtraEditMessage) =>
  Promise.resolve(<Message>{
    ...stubMessageText,
    message_id: extra?.reply_to_message_id || stubMessageText.message_id,
    text,
    chat: {
      ...stubChat,
      id: chatId
    }
  }));

// eslint-disable-next-line max-params
jest.spyOn(stubContext.telegram, "editMessageText").mockImplementation((chatId: string|number|void, messageId: number|void, inlineMessageId: string|void, text: string, extra?: ExtraEditMessage) =>
  Promise.resolve(<Message>{
    ...stubMessageText,
    message_id: extra?.reply_to_message_id || inlineMessageId || messageId,
    text,
    chat: {
      ...stubChat,
      id: chatId
    }
  }));

export default {
  stubContext
};
