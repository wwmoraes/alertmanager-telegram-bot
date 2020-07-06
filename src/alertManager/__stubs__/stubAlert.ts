/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {stubIUpdateAlertFiring, stubIUpdateAlertResolved} from "./stubIUpdateAlert";

export const stubAlertFiring = Alert.from(stubIUpdateAlertFiring);
export const stubAlertResolved = Alert.from(stubIUpdateAlertResolved);
