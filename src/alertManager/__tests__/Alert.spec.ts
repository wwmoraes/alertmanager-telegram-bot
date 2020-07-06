/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {stubIUpdateAlertFiring} from "../__stubs__/stubIUpdateAlert";
import {stubIAlertFiring} from "../__stubs__/stubIAlert";
import {IUpdateAlert} from "../typings/IAlertUpdate";

it("should load with valid alert interface", () => {
  const testAlert = Alert.from(stubIAlertFiring);

  expect(testAlert).toBeInstanceOf(Alert);
  expect(testAlert.baseUrl.toString()).toBe(`${stubIAlertFiring.baseUrl}`);
});

describe("valid update object", () => {
  it("should load with the provided external URL", () => {
    const testAlert = Alert.from(stubIUpdateAlertFiring);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).toBe(`${stubIUpdateAlertFiring.externalURL}/`);
  });

  it("should load with default external URL", () => {
    const testAlert = Alert.from(<IUpdateAlert>{...stubIUpdateAlertFiring,
      externalURL: "http://localhost:9093"});

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).not.toBe(stubIUpdateAlertFiring.externalURL);
  });
});

describe("invalid update object", () => {
  it("should error on update without group key", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {groupKey, ...incompleteUpdate} = stubIUpdateAlertFiring;

    expect(() =>
      Alert.from(incompleteUpdate as IUpdateAlert)).toThrowError("cannot create an alert from the provided object");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {status, ...incompleteUpdate} = stubIUpdateAlertFiring;

    expect(() =>
      Alert.from(incompleteUpdate as IUpdateAlert)).toThrowError("cannot create an alert from the provided object");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {receiver, ...incompleteUpdate} = stubIUpdateAlertFiring;

    expect(() =>
      Alert.from(incompleteUpdate as IUpdateAlert)).toThrowError("cannot create an alert from the provided object");
  });
});
