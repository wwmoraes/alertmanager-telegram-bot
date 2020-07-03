/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Composer} from "telegraf";
import type {IAlertManagerContext} from "./IAlertManagerContext";
import {alertManagerCBMiddleware} from "./alertManagerCBMiddleware";
import {alertManagerMiddleware} from "./alertManagerMiddleware";

export const alertManagerComposer = new Composer<IAlertManagerContext>();

alertManagerComposer.use(alertManagerMiddleware);
alertManagerComposer.on("callback_query", alertManagerCBMiddleware);

export default alertManagerComposer;
