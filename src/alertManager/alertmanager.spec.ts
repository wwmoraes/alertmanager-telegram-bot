jest.mock("node-fetch");

import {AlertManager} from "./alertmanager";
import {rmdirSync, mkdirSync} from "fs";
import crypto from "crypto";
import {AlertManagerContext} from "./context";
import {encodeToString} from "./messagepack";
import {CallbackData} from "./interfaces";
import {Alert} from "./alert";
import {fakeUpdate} from "./alert.spec";

import _fetch from "node-fetch";
import type {FetchMockSandbox} from "fetch-mock";
const fetchMock = _fetch as unknown as FetchMockSandbox;


const invalidDbPathPrefix = "tmp/non-existent";

const generatePaths = () => {
  const dbPathPrefix = `tmp/tests-${crypto.randomBytes(16).toString("hex")}`;
  const alertManagerDbPath = `${dbPathPrefix}/alertmanager-${crypto.randomBytes(16).toString("hex")}`;
  const alertsDbPath = `${dbPathPrefix}/alerts-${crypto.randomBytes(16).toString("hex")}`;

  return {
    dbPathPrefix,
    alertManagerDbPath,
    alertsDbPath
  };
};

describe("instance creation", () => {
  const {
    dbPathPrefix,
    alertManagerDbPath,
    alertsDbPath
  } = generatePaths();

  beforeAll(() => {
    rmdirSync(dbPathPrefix, {recursive: true});
    rmdirSync(invalidDbPathPrefix, {recursive: true});

    mkdirSync(dbPathPrefix, {recursive: true});
  });

  afterAll(() => {
    rmdirSync(dbPathPrefix, {recursive: true});
  });

  it("should instantiate successfully", () => {
    const alertManagerInstance = new AlertManager(alertManagerDbPath, alertsDbPath);

    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);
  });

  it("should error on non-existent alertmanager db base path", () => {
    expect(() =>
      new AlertManager(`${invalidDbPathPrefix}/alertmanager`, alertsDbPath)).
      toThrowError(`path ${invalidDbPathPrefix} does not exist`);
  });

  it("should error on non-existent alert db base path", () => {
    expect(() =>
      new AlertManager(alertManagerDbPath, `${invalidDbPathPrefix}/alerts`)).
      toThrow(`path ${invalidDbPathPrefix} does not exist`);
  });

  it("should process callback successfully", async () => {
    const next = jest.fn(() =>
      Promise.resolve());

    fetchMock.post("path:/api/v2/silences", {
      body: {
        silenceID: "silence1"
      }
    }, {sendAsJson: true});

    const alertData = new Alert(fakeUpdate);

    const callbackContext = {
      answerCbQuery: jest.fn(() =>
        Promise.resolve(true)),
      editMessageText: jest.fn(),
      reply: jest.fn(),
      adminUserIds: ["1"],
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
        } as CallbackData)
      }
    } as unknown as AlertManagerContext;

    const alertManagerInstance = new AlertManager(alertManagerDbPath, alertsDbPath);

    expect(alertManagerInstance).toBeDefined();
    expect(alertManagerInstance).toBeInstanceOf(AlertManager);

    await expect(alertManagerInstance.addUserChat("1", "1")).resolves.toBeUndefined();
    await expect(alertManagerInstance.addAlert(alertData)).resolves.toEqual(alertData);
    await expect(alertManagerInstance.addAlertMessage("1", "1", alertData.hash)).resolves.toEqual([]);

    const processResult = await alertManagerInstance.processCallback(callbackContext, next);

    expect(processResult).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });
});
