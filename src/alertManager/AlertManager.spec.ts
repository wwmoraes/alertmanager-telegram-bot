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
jest.mock("node-fetch");

import {rmdirSync, mkdirSync} from "fs";
import {validAlertUpdate} from "./__fixtures__/updates";
import pathGenerator from "./__fixtures__/pathGenerator";
import {IAlertManagerContext} from "./IAlertManagerContext";
import {ICallbackData} from "./ICallbackData";
import type {FetchMockSandbox} from "fetch-mock";

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

describe("instance creation", () => {
  const {dbPathPrefix, alertManagerDbPath, alertsDbPath} = pathGenerator();

  const next = jest.fn(() =>
    Promise.resolve());

  beforeAll(() => {
    rmdirSync(dbPathPrefix, {recursive: true});
    mkdirSync(dbPathPrefix, {recursive: true});
  });

  afterAll(() => {
    rmdirSync(dbPathPrefix, {recursive: true});
  });

  it("should instantiate successfully", async () => {
    const AlertManager = await (await import("./AlertManager")).AlertManager;

    let alertManagerInstance: typeof AlertManager.prototype|undefined = undefined;
    let error: Error|undefined = undefined;

    try {
      alertManagerInstance = new AlertManager(alertManagerDbPath(), alertsDbPath());
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);
  });

  it("should process callback successfully", async () => {
    const Alert = await (await import("./Alert")).Alert;
    const encodeToString = await (await import("./messagepack")).encodeToString;

    const nodeFetch = await (await import("node-fetch")).default;
    const fetchMock = nodeFetch as unknown as FetchMockSandbox;

    fetchMock.post("path:/api/v2/silences", {
      body: {
        silenceID: "silence1"
      }
    }, {sendAsJson: true});

    const alertData = new Alert(validAlertUpdate);

    const callbackContext = {
      answerCbQuery: jest.fn(() =>
        Promise.resolve(true)),
      editMessageText: jest.fn(),
      reply: jest.fn(),
      userIds: ["1"],
      updateType: "callback_query",
      callbackQuery: {
        id: "1",
        chat_instance: "1",
        from: {
          first_name: "jest",
          id: 1,
          is_bot: false,
          last_name: "tester",
          username: "jesttester"
        },
        message: {
          message_id: 1,
          date: Date.now(),
          chat: {
            id: 1,
            type: "private"
          }
        },
        data: encodeToString({
          module: "am",
          "do": "silence",
          params: {
            time: "1h"
          }
        } as ICallbackData)
      }
    } as unknown as IAlertManagerContext;

    const AlertManager = await (await import("./AlertManager")).AlertManager;

    let alertManagerInstance: typeof AlertManager.prototype|undefined = undefined;
    let error: Error|undefined = undefined;

    try {
      alertManagerInstance = new AlertManager(alertManagerDbPath(), alertsDbPath());
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);

    await expect(alertManagerInstance?.addUserChat("1", "1")).resolves.toBeUndefined();
    await expect(alertManagerInstance?.addAlert(alertData)).resolves.toEqual(alertData);
    await expect(alertManagerInstance?.addAlertMessage("1", "1", alertData.hash)).resolves.toEqual([]);

    const processResult = await alertManagerInstance?.processCallback(callbackContext, next);

    expect(processResult).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });
});

describe("callback invalid data handling", () => {
  const {dbPathPrefix, alertManagerDbPath, alertsDbPath} = pathGenerator();

  const next = jest.fn(() =>
    Promise.resolve());

  beforeAll(() => {
    rmdirSync(dbPathPrefix, {recursive: true});
    mkdirSync(dbPathPrefix, {recursive: true});
  });

  afterAll(() => {
    rmdirSync(dbPathPrefix, {recursive: true});
  });

  it("should error on empty callback query", async () => {
    process.env.ALERTMANAGER_DB_PATH = alertManagerDbPath();
    process.env.ALERTS_DB_PATH = alertsDbPath();

    const AlertManager = await (await import("./AlertManager")).AlertManager;

    let alertManagerInstance: typeof AlertManager.prototype|undefined = undefined;
    let error: Error|undefined = undefined;

    try {
      alertManagerInstance = new AlertManager(alertManagerDbPath(), alertsDbPath());
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);

    await expect(() =>
      alertManagerInstance?.processCallback({} as IAlertManagerContext, next)).
      rejects.
      toThrowError("no callback query");
  });

  it("should error on empty callback data", async () => {
    const AlertManager = await (await import("./AlertManager")).AlertManager;
    let alertManagerInstance: typeof AlertManager.prototype|undefined = undefined;
    let error: Error|undefined = undefined;

    try {
      alertManagerInstance = new AlertManager(alertManagerDbPath(), alertsDbPath());
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);

    await expect(() =>
      alertManagerInstance?.processCallback({callbackQuery: {}} as IAlertManagerContext, next)).
      rejects.
      toThrowError("no callback data");
  });

  it("should error on empty callback message", async () => {
    const AlertManager = await (await import("./AlertManager")).AlertManager;
    let alertManagerInstance: typeof AlertManager.prototype|undefined = undefined;
    let error: Error|undefined = undefined;

    try {
      alertManagerInstance = new AlertManager(alertManagerDbPath(), alertsDbPath());
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);

    await expect(() =>
      alertManagerInstance?.processCallback({callbackQuery: {data: ""}} as IAlertManagerContext, next)).
      rejects.
      toThrowError("no message on callback");
  });
});

// describe("database operations", () => {

// });
