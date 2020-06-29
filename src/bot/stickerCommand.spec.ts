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
  const stickerCommand = await (await import("./stickerCommand")).stickerCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;
  const mockMessageSticker = await (await import("../__fixtures__/mockMessage")).mockMessageSticker;

  mockBotContextValid.message = mockMessageSticker;

  await stickerCommand(mockBotContextValid);

  expect(mockBotContextValid.reply).toHaveBeenCalled();
  expect(mockBotContextValid.reply).toHaveBeenCalledWith("Sticker file ID MOCK_STICKER_FILE_ID 👍");
});

it("should error on update without message", async () => {
  const stickerCommand = await (await import("./stickerCommand")).stickerCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;

  mockBotContextValid.message = undefined;

  const testCommand = stickerCommand(mockBotContextValid);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("undefined message on update"));
  expect(mockBotContextValid.reply).not.toHaveBeenCalled();
});

it("should error on update without sticker", async () => {
  const stickerCommand = await (await import("./stickerCommand")).stickerCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;
  const mockMessageText = await (await import("../__fixtures__/mockMessage")).mockMessageText;

  mockBotContextValid.message = mockMessageText;
  mockBotContextValid.message.sticker = undefined;

  const testCommand = stickerCommand(mockBotContextValid);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("undefined sticker on update"));
  expect(mockBotContextValid.reply).not.toHaveBeenCalled();
});
