/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {stubContext} from "../../__stubs__/stubContext";
import {IBotContext} from "../typings/IBotContext";
import {alertManagerInstance} from "../../alertManager/__fixtures__/mockAlertManager";

export const mockIBotContext = mock<IBotContext>({
  ...stubContext,
  alertManager: alertManagerInstance,
  userIds: [stubContext.from?.id.toString()]
});

export default {
  mockIBotContext
};
