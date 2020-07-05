/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {stubContext} from "../../__stubs__/stubContext";
import {IBotContext} from "../typings/IBotContext";
import {mockAlertManagerInstance} from "../../alertManager/__fixtures__/mockAlertManager";

export const mockIBotContext = mock<IBotContext>({
  ...stubContext,
  alertManager: mockAlertManagerInstance,
  userIds: [stubContext.from?.id.toString()]
});

export default {
  mockIBotContext
};
