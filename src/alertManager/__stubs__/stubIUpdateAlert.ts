/**
 * @packageDocumentation
 * @module AlertManager
 */

import {IUpdateAlert} from "../typings/IAlertUpdate";

export const stubIUpdateAlertFiring: IUpdateAlert = {
  version: "4",
  groupKey: "{}:{alertname='ValidUpdate' }",
  status: "firing",
  receiver: "general",
  groupLabels: {alertname: "ValidUpdate"},
  commonLabels: {
    alertname: "ValidUpdate",
    instance: "docker-test",
    service: "test",
    severity: "warning"
  },
  commonAnnotations: {
    summary: "A valid update was sent",
    message: "test message fired manually",
    description: "no action is required"
  },
  externalURL: "https://alertmanager.domain.com:9093",
  alerts: [
    {
      status: "firing",
      labels: {
        "special-alert-label": "something distinct"
      },
      startsAt: "2020-06-21T16:48:43Z",
      endsAt: "2020-06-21T16:50:43Z",
      generatorURL: "https://prometheus.domain.com:9090/graph",
      fingerprint: "fingerprint",
      annotations: {
        annotation1: "value1"
      }
    }
  ],
  update_id: 1,
  truncatedAlerts: 0
};

export const stubIUpdateAlertResolved: IUpdateAlert = {
  ...stubIUpdateAlertFiring,
  status: "resolved"
};

export const stubIUpdateAlertFiring2: IUpdateAlert = {
  version: "4",
  groupKey: "{}:{alertname='ValidUpdate2' }",
  status: "firing",
  receiver: "general",
  groupLabels: {alertname: "ValidUpdate2"},
  commonLabels: {
    alertname: "ValidUpdate2",
    instance: "docker-test",
    service: "test",
    severity: "warning"
  },
  commonAnnotations: {
    summary: "A valid update was sent",
    message: "test message fired manually",
    description: "no action is required"
  },
  externalURL: "https://alertmanager.domain.com:9093",
  alerts: [
    {
      status: "firing",
      labels: {
        "special-alert-label": "something distinct"
      },
      startsAt: "2020-06-21T16:48:43Z",
      endsAt: "2020-06-21T16:50:43Z",
      generatorURL: "https://prometheus.domain.com:9090/graph",
      fingerprint: "fingerprint",
      annotations: {
        annotation1: "value1"
      }
    }
  ],
  update_id: 2,
  truncatedAlerts: 0
};

export const stubIUpdateAlertResolved2: IUpdateAlert = {
  ...stubIUpdateAlertFiring,
  status: "resolved"
};
