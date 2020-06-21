/**
 * @packageDocumentation
 * @module AdminOnly
 */

import {AdminOnlyContext} from "./context";
import {Middleware} from "telegraf";

/**
 * Only allows messages from the
 * [provided user IDs]{@link AdminOnlyContext.adminUserIds}
 */

export const AdminOnlyMiddleware: Middleware<AdminOnlyContext> =
  (ctx: AdminOnlyContext, next) => {
    // Not a known update type i.e. probably a webhook call
    if (typeof ctx.updateType === "undefined") {
      next();

      return;
    }

    // Drop without sender
    if (typeof ctx.from === "undefined") {
      return;
    }

    // Drop non-admin
    if (!ctx.adminUserIds.includes(ctx.from.id.toString())) {
      return;
    }

    next();
  };

export default AdminOnlyMiddleware;
