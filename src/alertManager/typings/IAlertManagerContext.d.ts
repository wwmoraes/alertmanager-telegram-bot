/**
 * @packageDocumentation
 * @module AlertManager
 */

import type { AlertManager } from "../AlertManager";
import type { Context } from "telegraf";

export interface IAlertManagerContext extends Context {
  alertManager: AlertManager,
  userIds: string[],
}
