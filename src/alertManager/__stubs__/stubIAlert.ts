/**
 * @packageDocumentation
 * @module AlertManager
 */

import type {IAlert} from "../typings/IAlert";
import {stubAlertFiring} from "./stubAlert";

export const stubIAlertFiring = <IAlert>{
  ...stubAlertFiring
};
