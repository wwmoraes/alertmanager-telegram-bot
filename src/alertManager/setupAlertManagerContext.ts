/**
 * @packageDocumentation
 * @module AlertManager
 */

import Telegraf from "telegraf";
import type {IAlertManagerContext} from "./typings/IAlertManagerContext";
import {AlertManager} from "./AlertManager";
import * as config from "./config";

export const setupAlertManagerContext = (bot: Telegraf<IAlertManagerContext>, users?: string[]): Promise<void> => {
  bot.context.alertManager = new AlertManager(
    config.alertManagerDbPath,
    config.alertsDbPath
  );

  if (typeof users === "undefined" || users.length === 0) {
    console.warn("no user ids provided to receive alertmanager messages");
    bot.context.userIds = [];
  } else {
    bot.context.userIds = users;
  }


  console.debug("adding admin users chats into context...");

  return Promise.all(bot.context.userIds.map((adminUserId) =>
    bot.telegram.getChat(adminUserId).then((chat) =>
      bot.context.alertManager.addUserChat(adminUserId, chat.id.toString())))).
    then(() =>
      Promise.resolve());
};
