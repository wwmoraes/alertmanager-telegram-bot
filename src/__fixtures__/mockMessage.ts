import {Message} from "telegraf/typings/telegram-types";
import {mockChat} from "./mockChat";

export const mockMessage: Message = {
  message_id: 1,
  chat: mockChat,
  date: Date.now()
};
