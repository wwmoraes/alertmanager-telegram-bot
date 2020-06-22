/**
 * @packageDocumentation
 * @module AlertManager
 */

import {AlertManager} from "./AlertManager";
import {Context} from "telegraf";

export interface IAlertManagerContext extends Context {
  alertManager: AlertManager,
  userIds: string[],
}
