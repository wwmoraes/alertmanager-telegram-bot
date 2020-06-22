/**
 * @packageDocumentation
 * @module AlertManager
 */

import Telegraf from "telegraf";
import {IAlertManagerContext} from "./IAlertManagerContext";
import {AlertManager} from "./AlertManager";
import config from "./config";

export const setupAlertManagerContext = (bot: Telegraf<IAlertManagerContext>): Promise<void> => {
  bot.context.alertManager = new AlertManager(
    config.alertManagerDbPath,
    config.alertsDbPath
  );

  console.debug("adding admin users chats into context...");

  return Promise.all(bot.context.userIds.map((adminUserId) =>
    bot.telegram.getChat(adminUserId).then((chat) =>
      bot.context.alertManager.addUserChat(adminUserId, chat.id.toString())))).
    catch((reason) =>
      Promise.reject(reason)).
    then(() =>
      Promise.resolve());
};
