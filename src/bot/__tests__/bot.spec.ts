/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-process-env */
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

  process.env.NODE_ENV = "test";

  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.INTERNAL_URL = "http://internal.test.localhost/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";
  process.env.TEMPLATE_FILE = "default.tmpl";
  process.env.PORT = "0";

  delete process.env.ALERTMANAGER_DB_PATH;
  delete process.env.ALERTS_DB_PATH;
});

it("should start bot successfully", async () => {
  const {nockGetChatScope200, nockSetWebhookScope200} = await import("../../__mocks__/TelegramAPI");

  nockGetChatScope200(nock, process.env.TELEGRAM_TOKEN, "1");
  nockSetWebhookScope200(nock, process.env.TELEGRAM_TOKEN);

  const botInstance = (await import("..")).bot();

  await botInstance.then((instance) =>
    instance.stop());
  await expect(botInstance).resolves.toBeDefined();
});

it("should fail to start if webhook not set", async () => {
  const {nockGetChatScope200, nockSetWebhookScope503} = await import("../../__mocks__/TelegramAPI");

  nockGetChatScope200(nock, process.env.TELEGRAM_TOKEN, "1");
  nockSetWebhookScope503(nock, process.env.TELEGRAM_TOKEN);

  await expect(() =>
    import("..").then((module) =>
      module.bot())).rejects.toThrowError("error setting the webhook");
});

it("should fail to start on getChat error", async () => {
  const {nockGetChatScope503, nockSetWebhookScope200} = await import("../../__mocks__/TelegramAPI");

  nockGetChatScope503(nock, process.env.TELEGRAM_TOKEN, "1");
  nockSetWebhookScope200(nock, process.env.TELEGRAM_TOKEN);

  await expect(() =>
    import("..").then((module) =>
      module.bot())).rejects.toThrowError("500: Unsupported http response from Telegram");
});
