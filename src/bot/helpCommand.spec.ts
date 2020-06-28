/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

import {BotContext} from "./BotContext";
import {mock} from "jest-mock-extended";
import {Message} from "telegraf/typings/telegram-types";

const botContext = mock<BotContext>();
const mockMessage = mock<Message>();

botContext.reply.mockImplementation(() =>
  Promise.resolve(mockMessage));

// const next = jest.fn(() =>
//   Promise.resolve());

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
});

it("should greet back", async () => {
  const helpCommand = await (await import("./helpCommand")).helpCommand;

  await helpCommand(botContext);

  expect(botContext.reply).toHaveBeenCalled();
  expect(botContext.reply).toHaveBeenCalledWith("Send me a sticker", undefined);
});
