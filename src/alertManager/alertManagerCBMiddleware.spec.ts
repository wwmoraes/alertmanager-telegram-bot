/**
 * @packageDocumentation
 * @module AlertManager
 */

/* eslint-disable @typescript-eslint/no-empty-function */
import {IAlertManagerContext} from "./IAlertManagerContext";

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

const next = jest.fn(() =>
  Promise.resolve());

it("should passthrough on empty chat", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {} as IAlertManagerContext;

  expect(alertManagerCBMiddleware(context, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should passthrough on empty from", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {
    chat: {}
  } as IAlertManagerContext;

  expect(alertManagerCBMiddleware(context, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should passthrough on empty callback query", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {
    chat: {},
    from: {}
  } as IAlertManagerContext;

  expect(alertManagerCBMiddleware(context, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should passthrough on empty callback query data", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {
    chat: {},
    from: {},
    callbackQuery: {}
  } as IAlertManagerContext;

  expect(alertManagerCBMiddleware(context, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should passthrough on empty callback query message", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {
    chat: {},
    from: {},
    callbackQuery: {
      data: {}
    }
  } as IAlertManagerContext;

  expect(alertManagerCBMiddleware(context, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should passthrough on empty callback query message from", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {
    chat: {},
    from: {},
    callbackQuery: {
      data: {},
      message: {}
    }
  } as IAlertManagerContext;

  expect(alertManagerCBMiddleware(context, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should process successfully", async () => {
  const alertManagerCBMiddleware = await (await import("./alertManagerCBMiddleware")).alertManagerCBMiddleware;

  const context = {
    alertManager: {
      processCallback: jest.fn((_ctx: IAlertManagerContext, _next: () => Promise<void>) =>
        Promise.resolve())
    },
    chat: {},
    from: {},
    callbackQuery: {
      data: {},
      from: {id: 1},
      chat_instance: "1",
      message: {
        message_id: 1,
        from: {id: 1}
      }
    }
  };

  expect(alertManagerCBMiddleware(context as unknown as IAlertManagerContext, next)).
    resolves.toBeUndefined();
  expect(next).toBeCalledTimes(0);
  expect(context.alertManager.processCallback).toBeCalledTimes(1);
});
