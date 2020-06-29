/**
 * @packageDocumentation
 * @module AlertManager
 */

import {ILabels} from "./ILabels";

export interface IAlertInfo {
  status: "resolved" | "firing",
  labels: ILabels,
  annotations: ILabels,
  startsAt: string,
  endsAt: string,
  generatorURL: string,
  fingerprint: string,
}
