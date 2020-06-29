/**
 * @packageDocumentation
 * @module AlertManager
 */

import {mock} from "jest-mock-extended";
import {alertManagerInstance} from "./mockAlertManager";
import {IAlertManagerContext} from "../IAlertManagerContext";
import {mockContextValid} from "../../__fixtures__/mockContext";
import {encodeToString} from "../messagepack";
import type {ICallbackData} from "../ICallbackData";

export const mockIAlertManagerContextValid = mock<IAlertManagerContext>({
  ...mockContextValid,
  alertManager: alertManagerInstance
});

export const mockIAlertManagerContextCallback = mock<IAlertManagerContext>({
  ...mockIAlertManagerContextValid,
  answerCbQuery: jest.fn(() =>
    Promise.resolve(true)),
  userIds: ["1"],
  updateType: "callback_query",
  callbackQuery: {
    id: "1",
    chat_instance: "1",
    from: {
      first_name: "jest",
      id: 1,
      is_bot: false,
      last_name: "tester",
      username: "jesttester"
    },
    message: {
      message_id: 1,
      date: Date.now(),
      chat: {
        id: 1,
        type: "private"
      }
    },
    data: encodeToString({
      module: "am",
      "do": "silence",
      params: {
        time: "1h"
      }
    } as ICallbackData)
  }
});

export default {
  mockIAlertManagerContextValid
};
