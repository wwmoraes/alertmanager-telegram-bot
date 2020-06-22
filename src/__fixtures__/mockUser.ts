import {User} from "telegraf/typings/telegram-types";

export const mockUserJest: User = {
  first_name: "Jest",
  id: 1,
  is_bot: false
};

export const mockUserBot: User = {
  first_name: "Bot",
  id: 1000,
  is_bot: true
};
