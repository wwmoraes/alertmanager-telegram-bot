/**
 * @packageDocumentation
 * @module AlertManager
 */

/* eslint-disable @typescript-eslint/no-empty-function */
import {IAlertManagerContext} from "./IAlertManagerContext";
import {mockUpdateAlert} from "./__fixtures__/mockUpdate";

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

it("should passthrough known update types", async () => {
  const alertManagerMiddleware = await (await import("./alertManagerMiddleware")).alertManagerMiddleware;

  expect(alertManagerMiddleware({updateType: "message"} as IAlertManagerContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should error with invalid update data", async () => {
  const update = {
    update: {}
  };

  const alertManagerMiddleware = await (await import("./alertManagerMiddleware")).alertManagerMiddleware;

  expect(alertManagerMiddleware(update as unknown as IAlertManagerContext, next)).
    rejects.toThrowError("no groupKey defined on update");
  expect(next).toBeCalledTimes(0);
});

it("should send alert", async () => {
  const update = {
    update: mockUpdateAlert,
    alertManager: {
      sendAlertMessages: jest.fn()
    }
  };

  const alertManagerMiddleware = await (await import("./alertManagerMiddleware")).alertManagerMiddleware;

  expect(alertManagerMiddleware(update as unknown as IAlertManagerContext, next)).
    toBeUndefined();
  expect(next).toBeCalledTimes(0);
  expect(update.alertManager.sendAlertMessages).toBeCalledTimes(1);
});
