/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {stubIUpdateAlert} from "../__stubs__/stubIUpdateAlert";
import {stubIAlert} from "../__stubs__/stubIAlert";
import {IUpdateAlert} from "../typings/IAlertUpdate";

it("should load with valid alert interface", () => {
  const testAlert = Alert.from(stubIAlert);

  expect(testAlert).toBeInstanceOf(Alert);
  expect(testAlert.baseUrl.toString()).toBe(`${stubIAlert.baseUrl}`);
});

describe("valid update object", () => {
  it("should load with the provided external URL", () => {
    const testAlert = Alert.from(stubIUpdateAlert);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).toBe(`${stubIUpdateAlert.externalURL}/`);
  });

  it("should load with default external URL", () => {
    const testAlert = Alert.from(<IUpdateAlert>{...stubIUpdateAlert,
      externalURL: "http://localhost:9093"});

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).not.toBe(stubIUpdateAlert.externalURL);
  });
});

describe("invalid update object", () => {
  it("should error on update without group key", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {groupKey, ...incompleteUpdate} = stubIUpdateAlert;

    expect(() =>
      Alert.from(incompleteUpdate as IUpdateAlert)).toThrowError("cannot create an alert from the provided object");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {status, ...incompleteUpdate} = stubIUpdateAlert;

    expect(() =>
      Alert.from(incompleteUpdate as IUpdateAlert)).toThrowError("cannot create an alert from the provided object");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {receiver, ...incompleteUpdate} = stubIUpdateAlert;

    expect(() =>
      Alert.from(incompleteUpdate as IUpdateAlert)).toThrowError("cannot create an alert from the provided object");
  });
});
