/**
 * @packageDocumentation
 * @module AlertManager
 */

import type { ITriple } from "level-ts/dist/LevelGraphTyping";
import type { IAlertManagerPredicates } from "./IAlertManagerPredicates";

/**
 * @callback IAlertMessageFilterFn
 * @param {ITriple<IAlertManagerPredicates>} triple database record to filter
 * @returns {boolean} true if the record is expected on the walk result
 * */
export type IAlertMessageFilterFn = (triple: ITriple<IAlertManagerPredicates>) => boolean;

/**
 * Filters to apply to queries that return [[IAlertMessage]]
 */
export interface IAlertMessageFilters {

  /** filter for [[IAlertManagerPredicates.Alerts]] records */
  [IAlertManagerPredicates.Alerts]?: IAlertMessageFilterFn;

  /** filter for [[IAlertManagerPredicates.ChatOn]] records */
  [IAlertManagerPredicates.ChatOn]?: IAlertMessageFilterFn;

  /** filter for [[IAlertManagerPredicates.HasMessage]] records */
  [IAlertManagerPredicates.HasMessage]?: IAlertMessageFilterFn;
}
