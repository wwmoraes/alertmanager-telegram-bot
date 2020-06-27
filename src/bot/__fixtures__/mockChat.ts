import {mock} from "jest-mock-extended";
import {Chat} from "telegraf/typings/telegram-types";

export const mockChatValid = mock<Chat>({
  id: 1
});

export default {
  mockChatValid
};
