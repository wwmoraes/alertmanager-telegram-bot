/**
 * @packageDocumentation
 * @module AlertManager
 */
/* eslint-disable no-process-env */
/* eslint-disable no-undef-init */
/* eslint-disable no-undefined */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-empty-function */

jest.mock("dotenv");

import nock from "nock";
import type {IAlertManagerContext} from "../typings/IAlertManagerContext";
import type {IAlertMatcher} from "../typings/IAlertMatcher";
import type {IAlertMessage} from "../typings/IAlertMessage";

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
  jest.useFakeTimers();
  nock.cleanAll();
});

afterEach(() => {
  jest.clearAllTimers();
});

describe("instance creation with different DB locations", () => {
  it("should instantiate with memory DB", async () => {
    const {AlertManager} = await import("../AlertManager");
    const mockAlertManager = new AlertManager();

    expect(mockAlertManager).toBeDefined();
    expect(mockAlertManager).toBeInstanceOf(AlertManager);
  });

  it("should instantiate with given LevelUp-compliant objects", async () => {
    type IAlert = import("../typings/IAlert").IAlert;
    const {AlertManager} = await import("../AlertManager");
    const levelup = (await import("levelup")).default;
    const encode = (await import("encoding-down")).default;
    const memdown = (await import("memdown")).default;
    const mockAlertManager = new AlertManager(
      levelup(encode(memdown<string, string>(), {
        valueEncoding: "string",
        keyEncoding: "string"
      })),
      levelup(encode(memdown<string, IAlert>(), {
        valueEncoding: "string",
        keyEncoding: "json"
      }))
    );

    expect(mockAlertManager).toBeDefined();
    expect(mockAlertManager).toBeInstanceOf(AlertManager);
  });
});

describe("callback handling", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  it("should process silence request successfully", async () => {
    const {stubIAlertManagerContextCallback} = await import("../__stubs__/stubIAlertManagerContext");
    const {stubAlertFiring} = await import("../__stubs__/stubAlert");

    const {nockAPIv2Silences200} = await import("../../__mocks__/AlertManagerAPI");

    nockAPIv2Silences200(nock, (body) =>
      body.matchers.length === stubAlertFiring.matchers.length &&
          body.matchers.every((matcher: IAlertMatcher, index: number) =>
            matcher.isRegex === stubAlertFiring.matchers[index].isRegex &&
            matcher.name === stubAlertFiring.matchers[index].name &&
            matcher.value === stubAlertFiring.matchers[index].value) &&
          body.createdBy === (stubIAlertManagerContextCallback.from?.username || "unknown") &&
          body.comment === "silenced from Telegram bot" &&
          body.id === null &&
          typeof body.startsAt !== "undefined" &&
          typeof body.endsAt !== "undefined", process.env.INTERNAL_URL);

    if (typeof stubIAlertManagerContextCallback.callbackQuery === "undefined") {
      throw new Error("unable to test: callback query is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.from === "undefined") {
      throw new Error("unable to test: callback from is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.message === "undefined") {
      throw new Error("unable to test: message is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.chat === "undefined") {
      throw new Error("unable to test: callback chat is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.callbackQuery.message === "undefined") {
      throw new Error("unable to test: callback query message is undefined");
    }

    // add user to current alertmanager instance
    await expect(stubIAlertManagerContextCallback.alertManager.addUserChat(
      stubIAlertManagerContextCallback.from.id.toString(),
      stubIAlertManagerContextCallback.chat.id.toString()
    )).resolves.toBeUndefined();

    // add alert to current alertmanager instance
    await expect(stubIAlertManagerContextCallback.alertManager.addAlert(stubAlertFiring)).
      resolves.toEqual(stubAlertFiring);

    // add message to current alertmanager instance
    await expect(stubIAlertManagerContextCallback.alertManager.addAlertMessage(
      stubIAlertManagerContextCallback.chat.id.toString(),
      stubIAlertManagerContextCallback.callbackQuery.message.message_id.toString(),
      stubAlertFiring.hash
    )).resolves.toBeUndefined();

    // add another alert message, for a distinct alert
    await expect(stubIAlertManagerContextCallback.alertManager.addAlertMessage(
      stubIAlertManagerContextCallback.chat.id.toString(),
      (stubIAlertManagerContextCallback.callbackQuery.message.message_id + 1).toString(),
      stubAlertFiring.hash + stubAlertFiring.hash
    )).resolves.toBeUndefined();

    await expect(stubIAlertManagerContextCallback.alertManager.getUnalertedChats(stubAlertFiring.hash)).
      resolves.toEqual([]);

    // check that the chat hasn't received the alert yet
    await expect(stubIAlertManagerContextCallback.alertManager.
      getAlertFromMessage(stubIAlertManagerContextCallback.callbackQuery.message.message_id.toString())).
      resolves.toEqual<IAlertMessage>({
        alertHash: stubAlertFiring.hash,
        chatId: stubIAlertManagerContextCallback.chat.id.toString(),
        messageId: stubIAlertManagerContextCallback.message.message_id.toString(),
        userId: stubIAlertManagerContextCallback.from.id.toString()
      });

    // process callback with existing data
    await expect(stubIAlertManagerContextCallback.alertManager.
      processCallback(stubIAlertManagerContextCallback, next)).resolves.toBeUndefined();
    await expect(next).not.toHaveBeenCalled();
  });

  it("should error on empty callback query", async () => {
    const {mockAlertManagerInstance} = await import("../__fixtures__/mockAlertManager");

    await expect(() =>
      mockAlertManagerInstance.processCallback({} as IAlertManagerContext, next)).
      rejects.toThrowError("no callback query");
  });

  it("should error on empty callback data", async () => {
    const {mockAlertManagerInstance} = await import("../__fixtures__/mockAlertManager");

    await expect(() =>
      mockAlertManagerInstance.processCallback({callbackQuery: {}} as IAlertManagerContext, next)).
      rejects.toThrowError("no callback data");
  });

  it("should error on empty callback message", async () => {
    const {mockAlertManagerInstance} = await import("../__fixtures__/mockAlertManager");

    await expect(() =>
      mockAlertManagerInstance.processCallback({callbackQuery: {data: ""}} as IAlertManagerContext, next)).
      rejects.
      toThrowError("no message on callback");
  });

  it("should not silence on network problems", async () => {
    const {nockAPIv2Silences503} = await import("../../__mocks__/AlertManagerAPI");
    const {stubIAlertManagerContextCallback} = await import("../__stubs__/stubIAlertManagerContext");
    const stubAlert = await (await import("../__stubs__/stubAlert")).stubAlertFiring;

    nockAPIv2Silences503(nock, (body) =>
      body.matchers.length === stubAlert.matchers.length &&
      body.matchers.every((matcher: IAlertMatcher, index: number) =>
        matcher.isRegex === stubAlert.matchers[index].isRegex &&
        matcher.name === stubAlert.matchers[index].name &&
        matcher.value === stubAlert.matchers[index].value) &&
      body.createdBy === (stubIAlertManagerContextCallback.from?.username || "unknown") &&
      body.comment === "silenced from Telegram bot" &&
      body.id === null &&
      typeof body.startsAt !== "undefined" &&
      typeof body.endsAt !== "undefined", process.env.INTERNAL_URL);

    if (typeof stubIAlertManagerContextCallback.callbackQuery === "undefined") {
      throw new Error("unable to test: callback query is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.from === "undefined") {
      throw new Error("unable to test: callback from is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.message === "undefined") {
      throw new Error("unable to test: message is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.chat === "undefined") {
      throw new Error("unable to test: callback chat is undefined");
    }

    if (typeof stubIAlertManagerContextCallback.callbackQuery.message === "undefined") {
      throw new Error("unable to test: callback query message is undefined");
    }

    // add user to current alertmanager instance
    await expect(stubIAlertManagerContextCallback.alertManager.addUserChat(
      stubIAlertManagerContextCallback.from.id.toString(),
      stubIAlertManagerContextCallback.chat.id.toString()
    )).resolves.toBeUndefined();

    // add alert to current alertmanager instance
    await expect(stubIAlertManagerContextCallback.alertManager.addAlert(stubAlert)).
      resolves.toEqual(stubAlert);

    // add message to current alertmanager instance
    await expect(stubIAlertManagerContextCallback.alertManager.addAlertMessage(
      stubIAlertManagerContextCallback.chat.id.toString(),
      stubIAlertManagerContextCallback.callbackQuery.message.message_id.toString(),
      stubAlert.hash
    )).resolves.toBeUndefined();

    await expect(() =>
      stubIAlertManagerContextCallback.alertManager.processCallback(stubIAlertManagerContextCallback, next)).
      rejects.toThrowError("Service Unavailable - user got a visual alert");
  });
});

it("should return if user has chat or not", async () => {
  const {mockAlertManagerInstance} = await import("../__fixtures__/mockAlertManager");

  // add user to current alertmanager instance
  expect(mockAlertManagerInstance.addUserChat("1", "1")).
    resolves.toBeUndefined();

  expect(mockAlertManagerInstance.hasUserChat("2", "2")).
    resolves.toBe(false);
  expect(mockAlertManagerInstance.hasUserChat("1", "2")).
    resolves.toBe(false);
  expect(mockAlertManagerInstance.hasUserChat("2", "1")).
    resolves.toBe(false);
  expect(mockAlertManagerInstance.hasUserChat("1", "1")).
    resolves.toBe(true);
});
