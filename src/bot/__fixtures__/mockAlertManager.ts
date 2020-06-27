import {AlertManager} from "../../alertManager/AlertManager";
import memdown from "memdown";
import {Alert} from "../../alertManager/Alert";
import levelup from "levelup";

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
