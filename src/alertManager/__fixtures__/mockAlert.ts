/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Alert} from "../Alert";
import {mockUpdateAlert} from "./mockUpdate";

export const alertValid = new Alert(mockUpdateAlert);

export default {
  alertValid
};
