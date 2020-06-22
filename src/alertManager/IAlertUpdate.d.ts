/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Update} from "telegraf/typings/telegram-types";
import {ILabels} from "./ILabels";
import {IAlertInfo} from "./IAlertInfo";

export interface IAlertUpdate extends Update {
  version: string;
  groupKey: string;
  truncatedAlerts: number;
  status: "resolved" | "firing";
  receiver: string;
  groupLabels: ILabels;
  commonLabels: ILabels;
  commonAnnotations: ILabels;
  externalURL?: string;
  alerts: IAlertInfo[];
}
