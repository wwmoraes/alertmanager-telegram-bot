/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {mockUpdateAlert} from "./mockUpdate";

export const alertValid = Alert.from(mockUpdateAlert);

export default {
  alertValid
};
