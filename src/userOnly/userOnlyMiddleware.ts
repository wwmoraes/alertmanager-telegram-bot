/**
 * @packageDocumentation
 * @module UserOnly
 */

import {IUserOnlyContext} from "./typings/IUserOnlyContext";
import {MiddlewareFn} from "telegraf/typings/composer";

/**
 * Only allows messages from the
 * [provided user IDs]{@link IUserOnlyContext.userIds}
 */

export const userOnlyMiddleware: MiddlewareFn<IUserOnlyContext> =
  (ctx: IUserOnlyContext, next) => {
    // Not a known update type i.e. probably a webhook call
    if (typeof ctx.updateType === "undefined") {
      return next();
    }

    // Drop without sender
    if (typeof ctx.from === "undefined") {
      return Promise.resolve();
    }

    // Drop non-admin
    if (!ctx.userIds.includes(ctx.from.id.toString())) {
      return Promise.resolve();
    }

    return next();
  };

export default userOnlyMiddleware;
