/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "./Alert";
import {validAlertUpdate} from "./__fixtures__/updates";
import {IAlertUpdate} from "./IAlertUpdate";

describe("valid update object", () => {
  it("should load with the provided external URL", () => {
    const testAlert = new Alert(validAlertUpdate);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).toBe(`${validAlertUpdate.externalURL}/`);
  });

  it("should load with default external URL", () => {
    const testAlert = new Alert({...validAlertUpdate,
      externalURL: "http://localhost:9093"} as IAlertUpdate);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).not.toBe(validAlertUpdate.externalURL);
  });
});

describe("invalid update object", () => {
  it("should error on update without group key", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {groupKey, ...incompleteUpdate} = validAlertUpdate;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no groupKey defined on update");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {status, ...incompleteUpdate} = validAlertUpdate;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no status defined on update");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {receiver, ...incompleteUpdate} = validAlertUpdate;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no receiver defined on update");
  });
});
