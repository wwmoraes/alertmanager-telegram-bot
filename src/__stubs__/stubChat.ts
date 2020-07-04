/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {Chat} from "telegraf/typings/telegram-types";

export const stubChat = mock<Chat>({
  id: 1
});

export default {
  stubChat
};
