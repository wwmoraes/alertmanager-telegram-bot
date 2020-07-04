/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

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
  const helpCommand = await (await import("../helpCommand")).helpCommand;

  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;

  await helpCommand(mockIBotContext);

  expect(mockIBotContext.reply).toHaveBeenCalled();
  expect(mockIBotContext.reply).toHaveBeenCalledWith("Send me a sticker", undefined);
});
