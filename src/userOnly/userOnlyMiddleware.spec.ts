/**
 * @packageDocumentation
 * @module UserOnly
 */

import userOnlyMiddleware from "./userOnlyMiddleware";
import IContext from "./IUserOnlyContext";

it("should passthrough on unknown update type", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(userOnlyMiddleware({} as IContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should drop request on known updates without from", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(userOnlyMiddleware({updateType: "message"} as IContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(0);
});

it("should drop request from non-admin", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(userOnlyMiddleware({
    updateType: "message",
    from: {id: 2},
    userIds: ["1"]
  } as IContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(0);
});

it("should forward admin requests", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(userOnlyMiddleware({
    updateType: "message",
    from: {id: 1},
    userIds: ["1"]
  } as IContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});
