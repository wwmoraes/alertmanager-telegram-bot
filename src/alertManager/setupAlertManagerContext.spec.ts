/**
 * @packageDocumentation
 * @module AlertManager
 */

/* eslint-disable no-undefined */
/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-empty-function */
import {rmdirSync, mkdirSync} from "fs";
import {Telegraf} from "telegraf/typings/telegraf";
import {IAlertManagerContext} from "./IAlertManagerContext";
import pathGenerator from "./__fixtures__/pathGenerator";

const {dbPathPrefix, alertManagerDbPath, alertsDbPath} = pathGenerator();

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});

  rmdirSync(dbPathPrefix, {recursive: true});
  mkdirSync(dbPathPrefix, {recursive: true});
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
});

afterAll(() => {
  rmdirSync(dbPathPrefix, {recursive: true});
});

it("should setup successfully", async () => {
  process.env.ALERTMANAGER_DB_PATH = alertManagerDbPath();
  process.env.ALERTS_DB_PATH = alertsDbPath();

  const setupAlertManagerContext = await (await import("./setupAlertManagerContext")).setupAlertManagerContext;

  const bot = {
    context: {
      userIds: ["1"],
      alertManager: undefined
    },
    telegram: {
      getChat: jest.fn((id: string|number) =>
        Promise.resolve({
          id,
          username: "jesttester"
        }))
    }
  };

  expect(setupAlertManagerContext(bot as unknown as Telegraf<IAlertManagerContext>)).resolves.toBeUndefined();

  const AlertManager = await (await import("./AlertManager")).AlertManager;
  const alertmanagerInstance = bot.context.alertManager as unknown as typeof AlertManager;

  expect(alertmanagerInstance).toBeDefined();
  expect(alertmanagerInstance.constructor).toBeInstanceOf(AlertManager.constructor);
  expect(bot.telegram.getChat).toHaveBeenCalledTimes(1);
});
