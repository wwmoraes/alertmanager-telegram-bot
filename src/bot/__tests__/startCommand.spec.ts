/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

jest.mock("dotenv");
jest.mock("../../alertManager/AlertManager");

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

it("should enroll the user and greet back", async () => {
  const startCommand = await (await import("../startCommand")).startCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;
  const mockAlertManager = await (await import("../../alertManager/__fixtures__/mockAlertManager")).default;

  await expect(mockIBotContext.alertManager.hasUserChat("1", "1")).
    resolves.toBe(false);
  mockAlertManager.hasUserChatSpy.mockClear();

  await startCommand(mockIBotContext);

  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledTimes(1);
  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockAlertManager.hasUserChatSpy.mock.results[0].value).
    resolves.toEqual(false);
  expect(mockAlertManager.addUserChatSpy).toHaveBeenCalledTimes(1);
  expect(mockAlertManager.addUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockIBotContext.reply).toHaveBeenCalledTimes(1);
  expect(mockIBotContext.reply).toHaveBeenCalledWith("Welcome!");
});

it("should reply that the user is already enrolled", async () => {
  const startCommand = await (await import("../startCommand")).startCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;
  const mockAlertManager = await (await import("../../alertManager/__fixtures__/mockAlertManager")).default;

  mockIBotContext.alertManager.addUserChat("1", "1");
  mockAlertManager.addUserChatSpy.mockClear();

  await startCommand(mockIBotContext);

  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledTimes(1);
  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockAlertManager.hasUserChatSpy.mock.results[0].value).
    resolves.toEqual(true);
  expect(mockAlertManager.addUserChatSpy).not.toHaveBeenCalled();
  expect(mockIBotContext.reply).toHaveBeenCalled();
});

it("should fail with undefined from", async () => {
  const startCommand = await (await import("../startCommand")).startCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;

  mockIBotContext.from = undefined;

  expect.assertions(3);

  expect(mockIBotContext.from).toBeUndefined();

  const testCommand = startCommand(mockIBotContext);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("no sender on the start request"));
  expect(mockIBotContext.reply).not.toHaveBeenCalled();
});

it("should fail with undefined chat", async () => {
  const startCommand = await (await import("../startCommand")).startCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;

  mockIBotContext.chat = undefined;

  expect.assertions(3);

  expect(mockIBotContext.chat).toBeUndefined();

  const testCommand = startCommand(mockIBotContext);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("no chat on the start request"));
  expect(mockIBotContext.reply).not.toHaveBeenCalled();
});
