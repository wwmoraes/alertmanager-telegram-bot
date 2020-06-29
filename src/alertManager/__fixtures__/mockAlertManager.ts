/**
 * @packageDocumentation
 * @module AlertManager
 */

import levelup from "levelup";
import memdown from "memdown";
import {AlertManager} from "../AlertManager";
import type {IAlert} from "../IAlert";

export const alertManagerInstance = new AlertManager(
  levelup(memdown<string, string>()),
  levelup(memdown<string, IAlert>())
);

export const addUserChatSpy = jest.spyOn(alertManagerInstance, "addUserChat");
export const hasUserChatSpy = jest.spyOn(alertManagerInstance, "hasUserChat");

export default {
  instance: alertManagerInstance,
  addUserChatSpy,
  hasUserChatSpy
};
