/**
 * Bot context extending both the [[AlertManagerContext]] and
 * [[IUserOnlyContext]]
 * @packageDocumentation
 * @module Bot
 */

import type {IUserOnlyContext} from "../../userOnly/typings/IUserOnlyContext";
import type {IAlertManagerContext} from "../../alertManager/typings/IAlertManagerContext";

export interface IBotContext extends IAlertManagerContext, IUserOnlyContext { }
