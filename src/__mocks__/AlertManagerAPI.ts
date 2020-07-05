import type {Scope, Options} from "nock";
import type {Url} from "url";
import {RequestBodyMatcher} from "nock/types";

type nockFn = (
  basePath: string | RegExp | Url,
  options?: Options
) => Scope;

export const nockAPIv2Silences200 = (
  nock: nockFn,
  requestBody?: RequestBodyMatcher,
  URL = "https://alertmanager.domain.com:9093"
): Scope =>
  nock(URL).
    post("/api/v2/silences", requestBody).
    reply(200, {silenceID: "silence1"});

export const nockAPIv2Silences503 = (
  nock: nockFn,
  requestBody?: RequestBodyMatcher,
  URL = "https://alertmanager.domain.com:9093"
): Scope =>
  nock(URL).
    post("/api/v2/silences", requestBody).
    reply(503, "Service Unavailable");
