/* eslint-disable no-process-env */
/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

import type {FetchMockSandbox} from "fetch-mock";
import levelup from "levelup";
import encode from "encoding-down";
import memdown from "memdown";
import type {IAlert} from "../alertManager/IAlert";

jest.mock("dotenv");
jest.mock("node-fetch");
jest.mock("../alertManager/AlertManager", () => {
  const originalAlertManager = jest.requireActual("../alertManager/AlertManager").AlertManager;

  class MockAlertManager extends originalAlertManager {
    constructor () {
      super(
        levelup(encode(memdown<string, string>(), {
          valueEncoding: "string",
          keyEncoding: "string"
        })),
        levelup(encode(memdown<string, IAlert>(), {
          valueEncoding: "string",
          keyEncoding: "json"
        }))
      );
    }
  }

  return {
    AlertManager: MockAlertManager
  };
});

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

  process.env.NODE_ENV = "test";

  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.INTERNAL_URL = "http://internal.test.localhost/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";
  process.env.TEMPLATE_FILE = "default.tmpl";
  process.env.PORT = "0";

  process.env.ALERTMANAGER_DB_PATH = "test-data/alertmanager";
  process.env.ALERTS_DB_PATH = "test-data/alerts";
});

it("should start bot successfully", async () => {
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

  const botInstance = (await import(".")).bot();

  await botInstance.then((instance) =>
    instance.stop());
  await expect(botInstance).resolves.toBeDefined();
});

it("should fail to start if webhook not set", async () => {
  const fetchMock = await (await import("node-fetch")).default as unknown as FetchMockSandbox;

  fetchMock.get("https://api.telegram.org/botTELEGRAM_TOKEN/setWebhook?url=https://test.domain.com/", 503);
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


  await expect(() =>
    import(".").then((module) =>
      module.bot())).rejects.toThrowError("error setting the webhook");
});

// it("should fail to start on getChat error", async () => {
//   const fetchMock = await (await import("node-fetch")).default as unknown as FetchMockSandbox;

//   fetchMock.get("https://api.telegram.org/botTELEGRAM_TOKEN/setWebhook?url=https://test.domain.com/", 503);
//   fetchMock.post("https://api.telegram.org/botTELEGRAM_TOKEN/getChat", 503);


//   await expect(() =>
//     import(".").then((module) =>
//       module.bot())).rejects.toThrowError("error setting the webhook");
// });
