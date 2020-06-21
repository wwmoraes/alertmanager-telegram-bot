/**
 * @packageDocumentation
 * @module AdminOnly
 */

import { TelegrafContext } from 'telegraf/typings/context';

/**
 * [[AdminOnly]] bot context which contains a [list of user IDs]{@link adminUserIds}
 * to allow interaction with
 */
export interface AdminOnlyContext extends TelegrafContext {
  /** list of Telegram user IDs to allow interactions with */
  adminUserIds: string[],
}

export default AdminOnlyContext;
