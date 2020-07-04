/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {User} from "telegraf/typings/telegram-types";

export const stubUserTest = mock<User>({
  id: 1,
  first_name: "jest",
  last_name: "test",
  is_bot: false,
  username: "jest_test"
});

export const stubUserBot = mock<User>({
  id: 1,
  first_name: "Alertmanager",
  last_name: "Bot",
  is_bot: true,
  username: "alertmanager_bot"
});

export default {
  stubUserTest,
  stubUserBot
};
