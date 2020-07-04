/**
 * @packageDocumentation
 * @module AlertManager
 */

/* eslint-disable @typescript-eslint/no-empty-function */
import type {IAlertManagerContext} from "../typings/IAlertManagerContext";
import {stubIUpdateAlert} from "../__stubs__/stubIUpdateAlert";

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
  const alertManagerMiddleware = await (await import("../alertManagerMiddleware")).alertManagerMiddleware;

  expect(alertManagerMiddleware({updateType: "message"} as IAlertManagerContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should error with invalid update data", async () => {
  const update = {
    update: {}
  };

  const alertManagerMiddleware = await (await import("../alertManagerMiddleware")).alertManagerMiddleware;

  expect(alertManagerMiddleware(update as unknown as IAlertManagerContext, next)).
    rejects.toThrowError("cannot create an alert from the provided object");
  expect(next).toBeCalledTimes(0);
});

it("should send alert", async () => {
  const update = {
    update: stubIUpdateAlert,
    alertManager: {
      sendAlertMessages: jest.fn()
    }
  };

  const alertManagerMiddleware = await (await import("../alertManagerMiddleware")).alertManagerMiddleware;

  expect(alertManagerMiddleware(update as unknown as IAlertManagerContext, next)).
    toBeUndefined();
  expect(next).toBeCalledTimes(0);
  expect(update.alertManager.sendAlertMessages).toBeCalledTimes(1);
});
