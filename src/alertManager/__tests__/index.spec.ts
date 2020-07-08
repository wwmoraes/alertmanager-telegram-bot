/**
 * @packageDocumentation
 * @module AlertManager
 */
/* eslint-disable max-lines-per-function */
/* eslint-disable prefer-destructuring */
/* eslint-disable init-declarations */
/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-empty-function */

import Telegraf, {Telegram} from "telegraf";
import type {IAlertManagerContext} from "../typings/IAlertManagerContext";
import nock from "nock";
import {MiddlewareFn} from "telegraf/typings/composer";
import {Alert} from "../Alert";
import {IUpdateAlert} from "../typings/IAlertUpdate";

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
  // jest.resetModules();
  // jest.resetModuleRegistry();
  nock.cleanAll();

  delete process.env.ALERTMANAGER_DB_PATH;
  delete process.env.ALERTS_DB_PATH;
});

it("should work with users provided", async () => {
  const {nockGetChatScope200} = await import("../../__mocks__/TelegramAPI");

  nockGetChatScope200(nock);

  const {setupAlertManagerContext, alertManagerComposer} = await import("..");

  const botInstance = new Telegraf<IAlertManagerContext>("TELEGRAM_TOKEN");

  botInstance.use(alertManagerComposer);

  await setupAlertManagerContext(botInstance, ["1"]);

  expect(botInstance.context.alertManager).toBeDefined();
});

it("should work without users provided", async () => {
  const {setupAlertManagerContext, alertManagerComposer} = await import("..");

  const botInstance = new Telegraf<IAlertManagerContext>("TOKEN");

  botInstance.use(alertManagerComposer);

  await setupAlertManagerContext(botInstance);

  expect(botInstance.context.alertManager).toBeDefined();
});

describe("work e2e", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  let alertManagerMiddleware: MiddlewareFn<IAlertManagerContext>;
  let sendAlertMessagesSpy: jest.SpyInstance<Promise<void>, [Alert, Telegram]>;
  let stubIAlertManagerContext: IAlertManagerContext;
  let stubIUpdateAlertFiring: IUpdateAlert;
  let stubIUpdateAlertResolved: IUpdateAlert;
  let stubAlertFiring: Alert;
  let stubAlertResolved: Alert;
  let stubAlertResolved2: Alert;

  beforeAll(async () => {
    alertManagerMiddleware = (await import("../alertManagerMiddleware")).alertManagerMiddleware;
    sendAlertMessagesSpy = (await import("../__fixtures__/mockAlertManager")).sendAlertMessagesSpy;
    stubIAlertManagerContext = (await import("../__stubs__/stubIAlertManagerContext")).stubIAlertManagerContext;
    stubIUpdateAlertFiring = (await import("../__stubs__/stubIUpdateAlert")).stubIUpdateAlertFiring;
    stubIUpdateAlertResolved = (await import("../__stubs__/stubIUpdateAlert")).stubIUpdateAlertResolved;
    stubAlertFiring = (await import("../__stubs__/stubAlert")).stubAlertFiring;
    stubAlertResolved = (await import("../__stubs__/stubAlert")).stubAlertResolved;
    stubAlertResolved2 = (await import("../__stubs__/stubAlert")).stubAlertResolved2;
  });

  it("should send firing alert for unsent chat", async () => {
    if (typeof stubIAlertManagerContext.from === "undefined") {
      throw new Error("test failed: context from is undefined");
    }

    if (typeof stubIAlertManagerContext.chat === "undefined") {
      throw new Error("test failed: context chat is undefined");
    }

    stubIAlertManagerContext.update = stubIUpdateAlertFiring;
    delete stubIAlertManagerContext.updateType;
    expect(stubIAlertManagerContext.alertManager.addUserChat(
      stubIAlertManagerContext.from.id.toString(),
      stubIAlertManagerContext.chat.id.toString()
    )).resolves.toBeUndefined();

    const {nockGetChatScope200} = await import("../../__mocks__/TelegramAPI");

    nockGetChatScope200(nock);

    await expect(alertManagerMiddleware(stubIAlertManagerContext, next)).resolves.toBeUndefined();

    await expect(next).not.toHaveBeenCalled();
    await expect(sendAlertMessagesSpy).toHaveBeenCalledWith(
      stubAlertFiring,
      stubIAlertManagerContext.telegram
    );
  });

  it("should edit message with resolved alert", async () => {
    if (typeof stubIAlertManagerContext.from === "undefined") {
      throw new Error("test failed: context from is undefined");
    }

    if (typeof stubIAlertManagerContext.chat === "undefined") {
      throw new Error("test failed: context chat is undefined");
    }

    if (typeof stubIAlertManagerContext.message === "undefined") {
      throw new Error("test failed: context message is undefined");
    }

    stubIAlertManagerContext.update = stubIUpdateAlertResolved;
    delete stubIAlertManagerContext.updateType;

    // add user to current alertmanager instance
    expect(stubIAlertManagerContext.alertManager.addUserChat(
      stubIAlertManagerContext.from.id.toString(),
      stubIAlertManagerContext.chat.id.toString()
    )).resolves.toBeUndefined();

    // add alerts to current alertmanager instance
    await expect(stubIAlertManagerContext.alertManager.addAlert(stubAlertResolved)).
      resolves.toEqual(stubAlertResolved);
    await expect(stubIAlertManagerContext.alertManager.addAlert(stubAlertResolved2)).
      resolves.toEqual(stubAlertResolved2);

    // add message to current alertmanager instance
    await expect(stubIAlertManagerContext.alertManager.addAlertMessage(
      stubIAlertManagerContext.chat.id.toString(),
      stubIAlertManagerContext.message.message_id.toString(),
      stubAlertResolved.hash
    )).resolves.toBeUndefined();

    // add another message, unrelated, to test the query
    await expect(stubIAlertManagerContext.alertManager.addAlertMessage(
      stubIAlertManagerContext.chat.id.toString(),
      stubIAlertManagerContext.message.message_id.toString(),
      stubAlertResolved.hash + stubAlertResolved.hash
    )).resolves.toBeUndefined();

    const {nockGetChatScope200} = await import("../../__mocks__/TelegramAPI");

    nockGetChatScope200(nock);

    await expect(alertManagerMiddleware(stubIAlertManagerContext, next)).
      resolves.toBeUndefined();

    await expect(next).not.toHaveBeenCalled();
    await expect(sendAlertMessagesSpy).toHaveBeenCalledWith(
      stubAlertResolved,
      stubIAlertManagerContext.telegram
    );
  });
});
