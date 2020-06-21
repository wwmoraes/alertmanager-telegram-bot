import {Alert} from "./alert";
import {AlertUpdate} from "./interfaces";

export const fakeUpdate: AlertUpdate = {
  "version": "4",
  "groupKey": "{}:{alertname='ValidUpdate' }",
  "status": "firing",
  "receiver": "general",
  "groupLabels": {"alertname": "ValidUpdate"},
  "commonLabels": {
    "alertname": "ValidUpdate",
    "instance": "docker-test",
    "service": "test",
    "severity": "warning"
  },
  "commonAnnotations": {
    "summary": "A valid update was sent",
    "message": "test message fired manually",
    "description": "no action is required"
  },
  "externalURL": "https://alertmanager.domain.com:9093",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "special-alert-label": "something distinct"
      },
      "startsAt": new Date("2020-06-21T16:48:43Z"),
      "endsAt": new Date("2020-06-21T16:50:43Z"),
      "generatorURL": "https://prometheus.domain.com:9090/graph",
      "fingerprint": "fingerprint",
      "annotations": {
        "annotation1": "value1"
      }
    }
  ],
  "update_id": 1,
  "truncatedAlerts": 0
};

describe("valid update object", () => {
  it("should load with the provided external URL", () => {
    const testAlert = new Alert(fakeUpdate);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).toBe(`${fakeUpdate.externalURL}/`);
  });

  it("should load with default external URL", () => {
    const testAlert = new Alert({...fakeUpdate,
      "externalURL": "http://localhost:9093"} as AlertUpdate);

    expect(testAlert).toBeInstanceOf(Alert);
    expect(testAlert.baseUrl.toString()).not.toBe(fakeUpdate.externalURL);
  });
});

describe("invalid update object", () => {
  it("should error on update without group key", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {groupKey, ...incompleteUpdate} = fakeUpdate;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no groupKey defined on update");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {status, ...incompleteUpdate} = fakeUpdate;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no status defined on update");
  });

  it("should error on update without status", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {receiver, ...incompleteUpdate} = fakeUpdate;

    expect(() =>
      new Alert(incompleteUpdate)).toThrowError("no receiver defined on update");
  });
});
