/**
 * @packageDocumentation
 * @module AdminOnly
 */

import { Middleware } from 'telegraf';
import { AdminOnlyContext } from './context';

/**
 * only allows messages from the [provided user IDs]{@link AdminOnlyContext.adminUserIds}
 */
export const AdminOnlyMiddleware: Middleware<AdminOnlyContext> = (ctx: AdminOnlyContext, next) => {
  // this is not a known update type i.e. probably a webhook call, so don't filter
  if (ctx.updateType === undefined) { next(); return; }

  // drop without sender
  if (ctx.from === undefined) return;

  // drop non-admin
  if (! ctx.adminUserIds.includes(ctx.from.id.toString())) return;

  next();
};

export default AdminOnlyMiddleware;
