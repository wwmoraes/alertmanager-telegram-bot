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

it("should reply to a sticker", async () => {
  const stickerCommand = await (await import("../stickerCommand")).stickerCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;
  const stubMessageSticker = await (await import("../../__stubs__/stubMessage")).stubMessageSticker;

  mockIBotContext.message = stubMessageSticker;

  await stickerCommand(mockIBotContext);

  expect(mockIBotContext.reply).toHaveBeenCalled();
  expect(mockIBotContext.reply).toHaveBeenCalledWith("Sticker file ID MOCK_STICKER_FILE_ID 👍");
});

it("should error on update without message", async () => {
  const stickerCommand = await (await import("../stickerCommand")).stickerCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;

  mockIBotContext.message = undefined;

  const testCommand = stickerCommand(mockIBotContext);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("undefined message on update"));
  expect(mockIBotContext.reply).not.toHaveBeenCalled();
});

it("should error on update without sticker", async () => {
  const stickerCommand = await (await import("../stickerCommand")).stickerCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;
  const stubMessageText = await (await import("../../__stubs__/stubMessage")).stubMessageText;

  mockIBotContext.message = stubMessageText;
  mockIBotContext.message.sticker = undefined;

  const testCommand = stickerCommand(mockIBotContext);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("undefined sticker on update"));
  expect(mockIBotContext.reply).not.toHaveBeenCalled();
});
