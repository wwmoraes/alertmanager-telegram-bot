/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {stubIUpdateAlert} from "./stubIUpdateAlert";

export const stubAlert = Alert.from(stubIUpdateAlert);

export default {
  stubAlert
};
