/**
 * @packageDocumentation
 * @module AlertManager
 */

import {AlertManager} from "../__mocks__/AlertManager";

export const alertManagerInstance = new AlertManager();

export const addUserChatSpy = jest.spyOn(alertManagerInstance, "addUserChat");
export const hasUserChatSpy = jest.spyOn(alertManagerInstance, "hasUserChat");
export const sendAlertMessagesSpy = jest.spyOn(alertManagerInstance, "sendAlertMessages");

export default {
  instance: alertManagerInstance,
  addUserChatSpy,
  hasUserChatSpy,
  sendAlertMessagesSpy
};
