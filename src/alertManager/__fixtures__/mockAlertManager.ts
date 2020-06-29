/**
 * @packageDocumentation
 * @module AlertManager
 */

import levelup from "levelup";
import memdown from "memdown";
import {AlertManager} from "../AlertManager";
import {Alert} from "../Alert";

export const alertManagerInstance = new AlertManager(
  levelup(memdown<string, string>()),
  levelup(memdown<string, Alert>())
);

export const addUserChatSpy = jest.spyOn(alertManagerInstance, "addUserChat");
export const hasUserChatSpy = jest.spyOn(alertManagerInstance, "hasUserChat");

export default {
  instance: alertManagerInstance,
  addUserChatSpy,
  hasUserChatSpy
};
