/**
 * @packageDocumentation
 * @module AlertManager
 */

import { IAlertMatcher } from "./IAlertMatcher";

export interface IAlert {
  readonly baseUrl: string;
  readonly isFiring: boolean;
  readonly hash: string;
  readonly text: string;
  readonly silenceUrl: string;
  readonly relatedAlertsUrl: string;
  readonly matchers: IAlertMatcher[];
}
