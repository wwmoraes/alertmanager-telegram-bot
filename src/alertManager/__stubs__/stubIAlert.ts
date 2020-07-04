/**
 * @packageDocumentation
 * @module AlertManager
 */

import type {IAlert} from "../typings/IAlert";
import {stubAlert} from "./stubAlert";

export const stubIAlert = <IAlert>{
  ...stubAlert
};

export default {
  stubIAlert
};
