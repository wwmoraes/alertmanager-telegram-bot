/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

jest.mock("dotenv");

import nock from "nock";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  nock.disableNetConnect();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
  nock.cleanAll();
});

it("should enroll the user and greet back", async () => {
  const startCommand = await (await import("../startCommand")).startCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;
  const {hasUserChatSpy, addUserChatSpy} = await import("../../alertManager/__fixtures__/mockAlertManager");

  await expect(mockIBotContext.alertManager.hasUserChat("1", "1")).
    resolves.toBe(false);
  hasUserChatSpy.mockClear();

  await startCommand(mockIBotContext);

  expect(hasUserChatSpy).toHaveBeenCalledTimes(1);
  expect(hasUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(hasUserChatSpy.mock.results[0].value).
    resolves.toEqual(false);
  expect(addUserChatSpy).toHaveBeenCalledTimes(1);
  expect(addUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockIBotContext.reply).toHaveBeenCalledTimes(1);
  expect(mockIBotContext.reply).toHaveBeenCalledWith("Welcome!");
});

it("should reply that the user is already enrolled", async () => {
  const startCommand = await (await import("../startCommand")).startCommand;
  const mockIBotContext = await (await import("../__mocks__/IBotContext")).mockIBotContext;
  const {addUserChatSpy, hasUserChatSpy} = await import("../../alertManager/__fixtures__/mockAlertManager");

  mockIBotContext.alertManager.addUserChat("1", "1");
  addUserChatSpy.mockClear();

  await startCommand(mockIBotContext);

  expect(hasUserChatSpy).toHaveBeenCalledTimes(1);
  expect(hasUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(hasUserChatSpy.mock.results[0].value).
    resolves.toEqual(true);
  expect(addUserChatSpy).not.toHaveBeenCalled();
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
