import {BotContext} from "../BotContext";
import {mock} from "jest-mock-extended";
import {mockUserTest} from "./mockUser";
import {mockChatValid} from "./mockChat";
import {mockMessageText} from "./mockMessage";
import {alertManagerInstance} from "./mockAlertManager";
import {Telegram} from "telegraf";
import {mockStickerSetValid} from "./mockStickerSet";

export const mockBotContextValid = mock<BotContext>({
  from: mockUserTest,
  chat: mockChatValid,
  reply: jest.fn(() =>
    Promise.resolve(mockMessageText)),
  alertManager: alertManagerInstance,
  telegram: mock<Telegram>({
    getStickerSet: jest.fn((_setName) =>
      Promise.resolve(mockStickerSetValid))
  })
});

export default {
  mockBotContextValid
};
