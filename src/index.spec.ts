/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef-init */
/* eslint-disable init-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-process-env */

jest.mock("dotenv");
jest.mock("node-fetch", () =>
  require("fetch-mock").sandbox());
interface BotMock {
  bot: () => Promise<Telegraf<BotContext>>,
  stop: () => Promise<void>
}
jest.mock("./bot", () => {
  const botModule = jest.requireActual("./bot");
  let bot: Promise<Telegraf<BotContext>>|undefined = undefined;

  return {
    bot: () => {
      if (typeof bot === "undefined") {
        bot = botModule.bot();
      }

      return bot;
    },
    stop: () =>
      bot?.then((botInstance: Telegraf<BotContext>) =>
        botInstance.stop())
  };
});

import "./ProcessEnv.d";
import pathGenerator from "./alertManager/__fixtures__/pathGenerator";
import {rmdirSync, mkdirSync} from "fs";
import Telegraf from "telegraf";
import {BotContext} from "./bot/BotContext";

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
  process.env.PORT = "0";
  Reflect.deleteProperty(process.env, "TEMPLATE_FILE");
  Reflect.deleteProperty(process.env, "TELEGRAM_TOKEN");
  Reflect.deleteProperty(process.env, "TELEGRAM_ADMINS");
  Reflect.deleteProperty(process.env, "EXTERNAL_URL");
  Reflect.deleteProperty(process.env, "INTERNAL_URL");

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
  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";

  type FetchMockSandbox = import("fetch-mock").FetchMockSandbox;
  const fetchMock = await import("node-fetch") as unknown as FetchMockSandbox;

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

  const botModule = await import("./bot") as BotMock;

  await botModule.stop();
});

it("should start bot successfully", async () => {
  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";

  type FetchMockSandbox = import("fetch-mock").FetchMockSandbox;
  const fetchMock = await import("node-fetch") as unknown as FetchMockSandbox;

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

  let bot: Telegraf<BotContext> | undefined = undefined;

  bot = await (await import("./bot")).bot();
  if (bot) {
    await bot.stop();
  }
  expect(bot).toBeDefined();
});

it("should fail to start on unknown error from Telegram", async () => {
  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";

  type FetchMockSandbox = import("fetch-mock").FetchMockSandbox;
  const fetchMock = await import("node-fetch") as unknown as FetchMockSandbox;

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

  let bot: Telegraf<BotContext> | undefined = undefined;

  try {
    bot = await (await import("./bot")).bot();
  } finally {
    if (bot) {
      bot.stop();
    }
    expect(bot).toBeDefined();
  }
});

// it("should fail to start if with no token provided", async () => {
//   process.env.TELEGRAM_TOKEN = undefined;

//   let bot: Telegraf<BotContext> | undefined = undefined;

//   try {
//     bot = await (await import("./index")).bot;
//   } finally {
//     if (bot) {
//       await bot.stop();
//     }
//     expect(bot).toBeUndefined();
//   }
// });
