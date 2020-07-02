/**
 * @packageDocumentation
 * @module AlertManager
 */

export interface IAlertMatcher {
  readonly name: string;
  readonly value: string;
  readonly isRegex: boolean;
}
