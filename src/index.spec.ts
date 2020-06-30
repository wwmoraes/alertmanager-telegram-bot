/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef-init */
/* eslint-disable init-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-process-env */

jest.mock("dotenv");
jest.mock("node-fetch");
jest.mock("telegraf");

import pathGenerator from "./alertManager/__fixtures__/pathGenerator";
import {rmdirSync, mkdirSync} from "fs";
import Telegraf from "telegraf";
import type {BotContext} from "./bot/BotContext";
import type {FetchMockSandbox} from "fetch-mock";

const {dbPathPrefix, alertManagerDbPath, alertsDbPath} = pathGenerator();

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});

  rmdirSync(dbPathPrefix, {recursive: true});
  mkdirSync(dbPathPrefix, {recursive: true});
});

beforeEach(() => {
  process.env.NODE_ENV = "test";

  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.INTERNAL_URL = "http://internal.test.localhost/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";
  process.env.TEMPLATE_FILE = "default.tmpl";
  process.env.PORT = "0";

  process.env.ALERTMANAGER_DB_PATH = alertManagerDbPath();
  process.env.ALERTS_DB_PATH = alertsDbPath();

  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
  // fetchMock.restore();
});

afterEach(() => {
  rmdirSync(process.env.ALERTMANAGER_DB_PATH!, {recursive: true});
  rmdirSync(process.env.ALERTS_DB_PATH!, {recursive: true});
});

afterAll(() => {
  rmdirSync(dbPathPrefix, {recursive: true});
});

it("should start sample successfully", async () => {
  const fetchMock = await (await import("node-fetch")).default as unknown as FetchMockSandbox;

  fetchMock.get("https://api.telegram.org/botTELEGRAM_TOKEN/setWebhook?url=https://test.domain.com/", 200);
  fetchMock.post("https://api.telegram.org/botTELEGRAM_TOKEN/getChat", {body: {
    ok: true,
    result: {
      id: 1
    }
  }}, {
    body: {
      chat_id: "1"
    }
  });

  expect(import(".")).resolves.toEqual({});
});

it("should fail to start on unknown error from Telegram", async () => {
  const fetchMock = await (await import("node-fetch")).default as unknown as FetchMockSandbox;

  fetchMock.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook?url=${process.env.EXTERNAL_URL}`, 500);
  fetchMock.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getChat`, {body: {
    ok: true,
    result: {
      id: 1
    }
  }}, {
    body: {
      chat_id: "1"
    }
  });

  let bot: Telegraf<BotContext> | void = undefined;
  const botModule = await import("./bot");

  try {
    bot = await botModule.bot().catch(console.error);
  } finally {
    if (bot) {
      bot.stop();
    }
    expect(bot).toBeUndefined();
  }
});

it("should fail to start if with no token provided", async () => {
  process.env.TELEGRAM_TOKEN = undefined;

  let bot: Telegraf<BotContext> | void = undefined;
  const botModule = await import("./bot");

  try {
    bot = await botModule.bot().catch(console.error);
  } finally {
    if (bot) {
      await bot.stop();
    }
    expect(bot).toBeUndefined();
  }
});
