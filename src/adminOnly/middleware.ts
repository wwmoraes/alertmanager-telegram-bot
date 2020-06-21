/**
 * @packageDocumentation
 * @module AdminOnly
 */

import {AdminOnlyContext} from "./context";
import {MiddlewareFn} from "telegraf/typings/composer";

/**
 * Only allows messages from the
 * [provided user IDs]{@link AdminOnlyContext.adminUserIds}
 */

export const AdminOnlyMiddleware: MiddlewareFn<AdminOnlyContext> =
  (ctx: AdminOnlyContext, next) => {
    // Not a known update type i.e. probably a webhook call
    if (typeof ctx.updateType === "undefined") {
      return next();
    }

    // Drop without sender
    if (typeof ctx.from === "undefined") {
      return Promise.resolve();
    }

    // Drop non-admin
    if (!ctx.adminUserIds.includes(ctx.from.id.toString())) {
      return Promise.resolve();
    }

    return next();
  };

export default AdminOnlyMiddleware;
