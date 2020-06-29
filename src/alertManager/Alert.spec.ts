/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "./Alert";
import {mockUpdateAlert} from "./__fixtures__/mockUpdate";
import {IAlertUpdate} from "./IAlertUpdate";

describe("valid update object", () => {
  it("should load with the provided external URL", () => {
    const testAlert = new Alert(mockUpdateAlert);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).toBe(`${mockUpdateAlert.externalURL}/`);
  });

  it("should load with default external URL", () => {
    const testAlert = new Alert({...mockUpdateAlert,
      externalURL: "http://localhost:9093"} as IAlertUpdate);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).not.toBe(mockUpdateAlert.externalURL);
  });
});

describe("invalid update object", () => {
  it("should error on update without group key", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {groupKey, ...incompleteUpdate} = mockUpdateAlert;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no groupKey defined on update");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {status, ...incompleteUpdate} = mockUpdateAlert;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no status defined on update");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {receiver, ...incompleteUpdate} = mockUpdateAlert;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no receiver defined on update");
  });
});
