/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

import type {FetchMockSandbox} from "fetch-mock";

jest.mock("dotenv");
jest.mock("node-fetch");

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
  const startCommand = await (await import("./startCommand")).startCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;
  const mockAlertManager = await (await import("../alertManager/__fixtures__/mockAlertManager")).default;

  await expect(mockBotContextValid.alertManager.hasUserChat("1", "1")).
    resolves.toBe(false);
  mockAlertManager.hasUserChatSpy.mockClear();

  await startCommand(mockBotContextValid);

  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledTimes(1);
  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockAlertManager.hasUserChatSpy.mock.results[0].value).
    resolves.toEqual(false);
  expect(mockAlertManager.addUserChatSpy).toHaveBeenCalledTimes(1);
  expect(mockAlertManager.addUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockBotContextValid.reply).toHaveBeenCalledTimes(1);
  expect(mockBotContextValid.reply).toHaveBeenCalledWith("Welcome!");
});

it("should reply that the user is already enrolled", async () => {
  const startCommand = await (await import("./startCommand")).startCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;
  const mockAlertManager = await (await import("../alertManager/__fixtures__/mockAlertManager")).default;

  mockBotContextValid.alertManager.addUserChat("1", "1");
  mockAlertManager.addUserChatSpy.mockClear();

  await startCommand(mockBotContextValid);

  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledTimes(1);
  expect(mockAlertManager.hasUserChatSpy).toHaveBeenCalledWith("1", "1");
  expect(mockAlertManager.hasUserChatSpy.mock.results[0].value).
    resolves.toEqual(true);
  expect(mockAlertManager.addUserChatSpy).not.toHaveBeenCalled();
  expect(mockBotContextValid.reply).toHaveBeenCalled();
});

it("should fail with undefined from", async () => {
  const startCommand = await (await import("./startCommand")).startCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;

  mockBotContextValid.from = undefined;

  expect.assertions(3);

  expect(mockBotContextValid.from).toBeUndefined();

  const testCommand = startCommand(mockBotContextValid);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("no sender on the start request"));
  expect(mockBotContextValid.reply).not.toHaveBeenCalled();
});

it("should fail with undefined chat", async () => {
  const startCommand = await (await import("./startCommand")).startCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;

  mockBotContextValid.chat = undefined;

  expect.assertions(3);

  expect(mockBotContextValid.chat).toBeUndefined();

  const testCommand = startCommand(mockBotContextValid);

  expect(testCommand).rejects.
    toEqual<Error>(new Error("no chat on the start request"));
  expect(mockBotContextValid.reply).not.toHaveBeenCalled();
});
