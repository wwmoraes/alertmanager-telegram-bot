/**
 * @packageDocumentation
 * @module AlertManager
 */

import {AlertManager} from "../AlertManager";

export const mockAlertManagerInstance = new AlertManager();

export const addUserChatSpy = jest.spyOn(mockAlertManagerInstance, "addUserChat");
export const hasUserChatSpy = jest.spyOn(mockAlertManagerInstance, "hasUserChat");
export const sendAlertMessagesSpy = jest.spyOn(mockAlertManagerInstance, "sendAlertMessages");
