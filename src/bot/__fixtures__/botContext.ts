import {BotContext} from "../BotContext";
import {mockContext} from "../../__fixtures__/mockContext";

export const botContext: BotContext = {
  ...mockContext,
  alertManager: {
    addAlert: jest.fn(),
    addAlertMessage: jest.fn(),
    addUserChat: jest.fn(),
    delAlert: jest.fn(),
    firingMessageMarkup: jest.fn(),
    getAlert: jest.fn(),
    getAlertFromMessage: jest.fn(),
    getAlertMessages: jest.fn(),
    getChats: jest.fn(),
    getUnalertedChats: jest.fn(),
    hasUserChat: jest.fn(),
    processCallback: jest.fn(),
    sendAlertMessages: jest.fn()
  },
  userIds: []
};

export default botContext;
