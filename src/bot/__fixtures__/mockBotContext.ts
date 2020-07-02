/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {mockContextValid} from "../../__fixtures__/mockContext";
import {BotContext} from "../BotContext";
import {alertManagerInstance} from "../../alertManager/__fixtures__/mockAlertManager";

export const mockBotContextValid = mock<BotContext>({
  ...mockContextValid,
  alertManager: alertManagerInstance,
  userIds: [mockContextValid.from?.id.toString()]
});

export default {
  mockBotContextValid
};
