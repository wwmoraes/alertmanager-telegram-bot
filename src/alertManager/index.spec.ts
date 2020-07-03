/**
 * @packageDocumentation
 * @module AlertManager
 */
/* eslint-disable @typescript-eslint/no-empty-function */
import Telegraf from "telegraf";
import {IAlertManagerContext} from "./IAlertManagerContext";

jest.mock("./AlertManager");

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

it("should work with users provided", async () => {
  const nock = (await import("nock")).default;
  const {nockGetChatScope200} = await import("../../__stubs__/telegramAPI");

  nockGetChatScope200(nock);

  const {setupAlertManagerContext, alertManagerComposer} = await import(".");

  const botInstance = new Telegraf<IAlertManagerContext>("TELEGRAM_TOKEN");

  botInstance.use(alertManagerComposer);

  await setupAlertManagerContext(botInstance, ["1"]);

  expect(botInstance.context.alertManager).toBeDefined();
});

it("should work without users provided", async () => {
  const {setupAlertManagerContext, alertManagerComposer} = await import(".");

  const botInstance = new Telegraf<IAlertManagerContext>("TOKEN");

  botInstance.use(alertManagerComposer);

  await setupAlertManagerContext(botInstance);

  expect(botInstance.context.alertManager).toBeDefined();
});

describe("work e2e", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  it("should send alert for unsent chat", async () => {
    const {alertManagerMiddleware} = await import("./alertManagerMiddleware");
    const {alertValid} = await import("./__fixtures__/mockAlert");
    const {sendAlertMessagesSpy} = await import("./__fixtures__/mockAlertManager");

    const {mockIAlertManagerContextValid} = await import("./__fixtures__/mockIAlertManagerContext");
    const {mockUpdateAlert} = await import("./__fixtures__/mockUpdate");

    mockIAlertManagerContextValid.update = mockUpdateAlert;

    const nock = (await import("nock")).default;
    const {nockGetChatScope200} = await import("../../__stubs__/telegramAPI");

    nockGetChatScope200(nock);

    await expect(alertManagerMiddleware(mockIAlertManagerContextValid, next)).resolves.toBeUndefined();

    await expect(next).not.toHaveBeenCalled();
    await expect(sendAlertMessagesSpy).toHaveBeenCalledWith(
      alertValid,
      mockIAlertManagerContextValid.telegram
    );
  });
});
