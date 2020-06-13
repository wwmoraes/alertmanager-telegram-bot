import { Middleware } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';

export const AdminOnlyMiddleware: Middleware<TelegrafContext> = (ctx, next) => {
  if (process.env.TELEGRAM_ADMIN === undefined) throw Error("TELEGRAM_ADMIN is not defined");

  // drop without sender
  if (ctx.from === undefined) return;

  // drop non-admin
  if (ctx.from.id.toString() !== process.env.TELEGRAM_ADMIN) return;

  next();
};
