/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * @packageDocumentation
 * @module AlertManager
 */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-process-env */
/* eslint-disable no-undef-init */
/* eslint-disable no-undefined */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-empty-function */

import type {FetchMockSandbox} from "fetch-mock";

jest.mock("dotenv");
jest.mock("node-fetch");

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
});

describe("instance creation", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  it("should instantiate successfully", async () => {
    const AlertManager = await (await import("./AlertManager")).AlertManager;

    const mockAlertManager = await (await import("./__fixtures__/mockAlertManager")).default;

    expect(mockAlertManager.instance).toBeDefined();
    expect(mockAlertManager.instance).toBeInstanceOf(AlertManager);
  });

  it("should process callback successfully", async () => {
    const fetchMock = await (await import("node-fetch")).default as unknown as FetchMockSandbox;
    const callbackContext = await (await import("./__fixtures__/mockIAlertManagerContext")).mockIAlertManagerContextCallback;
    const mockAlertManager = await (await import("./__fixtures__/mockAlertManager")).default;
    const alertValid = await (await import("./__fixtures__/mockAlert")).alertValid;

    fetchMock.post("https://alertmanager.domain.com:9093/api/v2/silences", {
      body: {
        silenceID: "silence1"
      }
    }, {
      sendAsJson: true,
      matchPartialBody: true,
      body: {
        matchers: alertValid.matchers,
        createdBy: callbackContext.from?.username || "unknown",
        comment: "silenced from Telegram bot",
        id: null
      }
    });

    if (typeof callbackContext.callbackQuery === "undefined") {
      throw new Error("unable to test: callback query is undefined");
    }

    if (typeof callbackContext.from === "undefined") {
      throw new Error("unable to test: callback from is undefined");
    }

    if (typeof callbackContext.chat === "undefined") {
      throw new Error("unable to test: callback chat is undefined");
    }

    if (typeof callbackContext.callbackQuery.message === "undefined") {
      throw new Error("unable to test: callback query message is undefined");
    }

    // add user to current alertmanager instance
    const addUserPromise = mockAlertManager.instance.addUserChat(
      callbackContext.from.id.toString(),
      callbackContext.chat.id.toString()
    );

    await expect(addUserPromise).resolves.toBeUndefined();

    // add alert to current alertmanager instance
    const addAlertPromise = mockAlertManager.instance.addAlert(alertValid);

    await expect(addAlertPromise).resolves.toEqual(alertValid);

    // add message to current alertmanager instance
    const addMessagePromise = mockAlertManager.instance.addAlertMessage(
      callbackContext.chat.id.toString(),
      callbackContext.callbackQuery.message.message_id.toString(),
      alertValid.hash
    );

    await expect(addMessagePromise).resolves.toBeUndefined();

    // add another alert message, for a distinct alert
    await expect(mockAlertManager.instance.addAlertMessage(
      callbackContext.chat.id.toString(),
      (callbackContext.callbackQuery.message.message_id + 1).toString(),
      alertValid.hash + alertValid.hash
    )).resolves.toBeUndefined();

    // check that the chat hasn't received the alert yet
    const getAlertFromMessagePromise = mockAlertManager.instance.
      getAlertFromMessage(callbackContext.callbackQuery.message.message_id.toString());

    await expect(getAlertFromMessagePromise).resolves.toBeDefined();

    // process callback with existing data
    const processResultPromise = mockAlertManager.instance.
      processCallback(callbackContext, next);

    await expect(processResultPromise).resolves.toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });
});

describe("callback invalid data handling", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  it("should error on empty callback query", async () => {
    type IAlertManagerContext = import("./IAlertManagerContext").IAlertManagerContext;
    const AlertManager = await (await import("./AlertManager")).AlertManager;

    const mockAlertManager = await (await import("./__fixtures__/mockAlertManager")).default;

    expect(mockAlertManager.instance).toBeDefined();
    expect(mockAlertManager.instance).toBeInstanceOf(AlertManager);

    await expect(() =>
      mockAlertManager.instance.processCallback({} as IAlertManagerContext, next)).
      rejects.
      toThrowError("no callback query");
  });

  it("should error on empty callback data", async () => {
    type IAlertManagerContext = import("./IAlertManagerContext").IAlertManagerContext;
    const AlertManager = await (await import("./AlertManager")).AlertManager;

    const mockAlertManager = await (await import("./__fixtures__/mockAlertManager")).default;

    expect(mockAlertManager.instance).toBeDefined();
    expect(mockAlertManager.instance).toBeInstanceOf(AlertManager);

    await expect(() =>
      mockAlertManager.instance.processCallback({callbackQuery: {}} as IAlertManagerContext, next)).
      rejects.toThrowError("no callback data");
  });

  it("should error on empty callback message", async () => {
    type IAlertManagerContext = import("./IAlertManagerContext").IAlertManagerContext;
    const AlertManager = await (await import("./AlertManager")).AlertManager;

    const mockAlertManager = await (await import("./__fixtures__/mockAlertManager")).default;

    expect(mockAlertManager.instance).toBeDefined();
    expect(mockAlertManager.instance).toBeInstanceOf(AlertManager);

    await expect(() =>
      mockAlertManager.instance.processCallback({callbackQuery: {data: ""}} as IAlertManagerContext, next)).
      rejects.
      toThrowError("no message on callback");
  });
});

// describe("database operations", () => {

// });
