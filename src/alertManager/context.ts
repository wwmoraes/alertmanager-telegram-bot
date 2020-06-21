/**
 * @packageDocumentation
 * @module AlertManager
 */

import {AlertManager} from "./alertmanager";
import {Context} from "telegraf";

export interface AlertManagerContext extends Context {
  alertManager: AlertManager,
  adminUserIds: string[],
}
