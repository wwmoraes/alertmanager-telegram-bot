/**
 * Bot context extending both the [[AlertManagerContext]] and
 * [[IUserOnlyContext]]
 * @packageDocumentation
 * @module Bot
 */

import type {IUserOnlyContext} from "../userOnly/IUserOnlyContext";
import type {IAlertManagerContext} from "../alertManager/IAlertManagerContext";

export interface BotContext extends IAlertManagerContext, IUserOnlyContext { }
