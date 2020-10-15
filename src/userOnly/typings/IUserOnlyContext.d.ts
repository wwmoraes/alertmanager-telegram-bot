/**
 * @packageDocumentation
 * @module UserOnly
 */

import {TelegrafContext} from "telegraf/typings/context";

/**
 * [[UserOnly]] bot context which contains a
 * [list of user IDs]{@link userIds} to allow interaction with
 */
export interface IUserOnlyContext extends TelegrafContext {

  /** List of Telegram user IDs to allow interactions with */
  userIds: string[],
}
