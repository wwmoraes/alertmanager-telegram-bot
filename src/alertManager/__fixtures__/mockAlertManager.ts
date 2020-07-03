/**
 * @packageDocumentation
 * @module AlertManager
 */

import levelup from "levelup";
import encode from "encoding-down";
import memdown from "memdown";
import {AlertManager} from "../AlertManager";
import type {IAlert} from "../IAlert";

export const alertManagerInstance = new AlertManager(
  levelup(encode(memdown<string, string>(), {
    valueEncoding: "string",
    keyEncoding: "string"
  })),
  levelup(encode(memdown<string, IAlert>(), {
    valueEncoding: "string",
    keyEncoding: "json"
  }))
);

export const addUserChatSpy = jest.spyOn(alertManagerInstance, "addUserChat");
export const hasUserChatSpy = jest.spyOn(alertManagerInstance, "hasUserChat");
export const sendAlertMessagesSpy = jest.spyOn(alertManagerInstance, "sendAlertMessages");

export default {
  instance: alertManagerInstance,
  addUserChatSpy,
  hasUserChatSpy,
  sendAlertMessagesSpy
};
