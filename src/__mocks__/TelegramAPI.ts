import type {Scope, Options} from "nock";
import type {Url} from "url";

type nockFn = (
  basePath: string | RegExp | Url,
  options?: Options
) => Scope;

export const nockSetWebhookScope200 = (
  nock: nockFn,
  telegramToken = "TELEGRAM_TOKEN",
  URL = "https://test.domain.com/"
): Scope =>
  nock("https://api.telegram.org").
    get(`/bot${telegramToken}/setWebhook?url=${URL}`).
    reply(200);

export const nockSetWebhookScope503 = (
  nock: nockFn,
  telegramToken = "TELEGRAM_TOKEN",
  URL = "https://test.domain.com/"
): Scope =>
  nock("https://api.telegram.org").
    get(`/bot${telegramToken}/setWebhook?url=${URL}`).
    reply(503);

export const nockGetChatScope200 = (
  nock: nockFn,
  telegramToken = "TELEGRAM_TOKEN",
  chatId = "1"
): Scope =>
  nock("https://api.telegram.org").
    post(`/bot${telegramToken}/getChat`, {chat_id: chatId}).
    reply(200, {
      ok: true,
      result: {id: chatId}
    });

export const nockGetChatScope503 = (
  nock: nockFn,
  telegramToken = "TELEGRAM_TOKEN",
  chatId = "1"
): Scope =>
  nock("https://api.telegram.org").
    post(`/bot${telegramToken}/getChat`, {chat_id: chatId}).
    reply(503);
