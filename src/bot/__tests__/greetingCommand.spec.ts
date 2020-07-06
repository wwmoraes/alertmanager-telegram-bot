/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

import nock from "nock";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  nock.disableNetConnect();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
  nock.cleanAll();
});

it("should greet back", async () => {
  const greetingCommand = await (await import("../greetingCommand")).greetingCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;

  await greetingCommand(mockIBotContext);

  expect(mockIBotContext.reply).toHaveBeenCalled();
  expect(mockIBotContext.reply).toHaveBeenCalledWith("Hey there", undefined);
});
