/**
 * @packageDocumentation
 * @module AlertManager
 */

import {ILabels} from "./ILabels";

export interface IAlertInfo {
  status: "resolved" | "firing",
  labels: ILabels,
  annotations: ILabels,
  startsAt: Date,
  endsAt: Date,
  generatorURL: string,
  fingerprint: string,
}
