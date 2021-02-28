/**
 * @packageDocumentation
 * @module UserOnly
 */

import type { Context } from "telegraf";

/**
 * [[UserOnly]] bot context which contains a
 * [list of user IDs]{@link userIds} to allow interaction with
 */
export interface IUserOnlyContext extends Context {

  /** List of Telegram user IDs to allow interactions with */
  userIds: string[],
}
