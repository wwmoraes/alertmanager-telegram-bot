/**
 * @packageDocumentation
 * @module AlertManager
 */

import {alertManagerInstance} from "./mockAlertManager";
import {IAlertManagerContext} from "../IAlertManagerContext";
import {mockContextValid} from "../../__fixtures__/mockContext";
import {encodeToString} from "../messagepack";
import type {ICallbackData} from "../ICallbackData";
import {mockUserTest} from "../../__fixtures__/mockUser";

export const mockIAlertManagerContextValid = <IAlertManagerContext>{
  ...mockContextValid,
  alertManager: alertManagerInstance,
  userIds: [mockUserTest.id.toString()]
};

export const mockIAlertManagerContextCallback = <IAlertManagerContext>{
  ...mockContextValid,
  ...mockIAlertManagerContextValid,
  answerCbQuery: jest.fn(() =>
    Promise.resolve(true)),
  updateType: "callback_query",
  callbackQuery: {
    id: "1",
    chat_instance: mockIAlertManagerContextValid.chat?.id.toString(),
    from: mockIAlertManagerContextValid.from,
    message: mockIAlertManagerContextValid.message,
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
  mockIAlertManagerContextValid,
  mockIAlertManagerContextCallback
};
