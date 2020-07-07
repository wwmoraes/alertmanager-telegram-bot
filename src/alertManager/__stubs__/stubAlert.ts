/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {
  stubIUpdateAlertFiring,
  stubIUpdateAlertResolved,
  stubIUpdateAlertFiring2,
  stubIUpdateAlertResolved2
} from "./stubIUpdateAlert";

export const stubAlertFiring = Alert.from(stubIUpdateAlertFiring);
export const stubAlertResolved = Alert.from(stubIUpdateAlertResolved);
export const stubAlertFiring2 = Alert.from(stubIUpdateAlertFiring2);
export const stubAlertResolved2 = Alert.from(stubIUpdateAlertResolved2);
