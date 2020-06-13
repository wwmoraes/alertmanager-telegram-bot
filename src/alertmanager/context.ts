import { TelegrafContext } from 'telegraf/typings/context';
import level, { LevelGraph } from 'level-ts';
import { AlertUpdate } from './interfaces';

// index: user ID
export interface ChatEntry {
  chatId: number;
  messages?: [{
    messageId: number;
    alertHash: string;
  }];
}

export interface BotContext extends TelegrafContext {
  chats: level<ChatEntry>,
  alerts: level<AlertUpdate>,
  alertmanager: LevelGraph,
}
