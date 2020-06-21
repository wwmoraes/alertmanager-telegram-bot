import middleware from "./middleware";
import AdminOnlyContext from "./context";

it("should passthrough on unknown update type", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(middleware({} as AdminOnlyContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});

it("should drop request on known updates without from", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(middleware({updateType: "message"} as AdminOnlyContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(0);
});

it("should drop request from non-admin", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(middleware({
    updateType: "message",
    from: {id: 2},
    adminUserIds: ["1"]
  } as AdminOnlyContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(0);
});

it("should forward admin requests", () => {
  const next = jest.fn(() =>
    Promise.resolve());

  expect(middleware({
    updateType: "message",
    from: {id: 1},
    adminUserIds: ["1"]
  } as AdminOnlyContext, next)).resolves.toBeUndefined();
  expect(next).toBeCalledTimes(1);
});
