import { Context } from 'telegraf';
import { AlertManager } from './alertmanager';

export interface AlertManagerContext extends Context {
  alertManager: AlertManager,
  adminUserIds: string[],
}
