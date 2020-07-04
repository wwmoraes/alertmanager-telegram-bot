/**
 * @packageDocumentation
 * @module AlertManager
 */

import type {IAlertManagerContext} from "../typings/IAlertManagerContext";
import type {ICallbackData} from "../typings/ICallbackData";
import {encodeToString} from "../messagepack";
import {alertManagerInstance} from "../__fixtures__/mockAlertManager";
import {stubContext} from "../../__stubs__/stubContext";
import {stubUserTest} from "../../__stubs__/stubUser";
import type {AlertManager} from "../AlertManager";

export const stubIAlertManagerContext = <IAlertManagerContext>{
  ...stubContext,
  alertManager: alertManagerInstance as AlertManager,
  userIds: [stubUserTest.id.toString()]
};

export const stubIAlertManagerContextCallback = <IAlertManagerContext>{
  ...stubContext,
  ...stubIAlertManagerContext,
  answerCbQuery: jest.fn(() =>
    Promise.resolve(true)),
  updateType: "callback_query",
  callbackQuery: {
    id: "1",
    chat_instance: stubIAlertManagerContext.chat?.id.toString(),
    from: stubIAlertManagerContext.from,
    message: stubIAlertManagerContext.message,
    data: encodeToString({
      module: "am",
      "do": "silence",
      params: {
        time: "1h"
      }
    } as ICallbackData)
  }
};

export default {
  stubIAlertManagerContext,
  stubIAlertManagerContextCallback
};
