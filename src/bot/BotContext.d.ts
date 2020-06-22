/**
 * Bot context extending both the [[AlertManagerContext]] and
 * [[IUserOnlyContext]]
 * @packageDocumentation
 * @module Bot
 */

import {IUserOnlyContext} from "../userOnly";
import {IAlertManagerContext} from "../alertManager";

export interface BotContext extends IAlertManagerContext, IUserOnlyContext { }
