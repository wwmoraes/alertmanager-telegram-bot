import {IAlertManagerContext} from "./IAlertManagerContext";
import {Alert} from "./Alert";
import {MiddlewareFn} from "telegraf/typings/composer";

export const alertManagerMiddleware: MiddlewareFn<IAlertManagerContext> = (ctx: IAlertManagerContext, next): Promise<void> => {
  // Pass-through in case it is not an alertmanager update
  console.info("[AlertManager] checking if update has a known type...");
  if (typeof ctx.updateType !== "undefined") {
    return next();
  }

  try {
    console.info("[AlertManager] parsing alert update...");
    const alert = new Alert(ctx.update);

    console.info("[AlertManager] sending alert messages...");

    return ctx.alertManager.sendAlertMessages(
      alert,
      ctx.telegram
    );
  } catch (error) {
    return Promise.reject(error);
  }
};
