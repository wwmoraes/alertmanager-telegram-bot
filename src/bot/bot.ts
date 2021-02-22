/**
 * Bot instance safe factory
 *
 * @packageDocumentation
 * @module Bot
 */
/* global console */

import { Telegraf } from "telegraf";
import fetch from "node-fetch";

import type { IBotContext } from "./typings/IBotContext";
import { startCommand } from "./startCommand";
import { helpCommand } from "./helpCommand";
import { stickerCommand } from "./stickerCommand";
import { greetingCommand } from "./greetingCommand";

import { setupAlertManagerContext, alertManagerComposer } from "../alertManager";
import { userOnlyMiddleware } from "../userOnly";
import * as config from "./config";

/**
 * safely creates the bot instance
 *
 * @returns {Promise<Telegraf<IBotContext>>} bot instance
 */
export const bot = async (): Promise<Telegraf<IBotContext>> => {
  // eslint-disable-next-line init-declarations,no-undef-init,no-undefined
  const botInstance = new Telegraf<IBotContext>(
    config.telegramToken,
    { telegram: { webhookReply: false } }
  );

  console.info("setting up alert manager context...");
  try {
    await setupAlertManagerContext(botInstance, config.telegramAdmins.split(","));
  } catch (error) {
    botInstance.stop();

    return Promise.reject(error);
  }

  console.info("registering middlewares...");
  botInstance.use(
    userOnlyMiddleware,
    alertManagerComposer
  );

  console.info("registering commands...");
  botInstance.start(startCommand);
  botInstance.help(helpCommand);
  botInstance.on("sticker", stickerCommand);
  botInstance.hears("hi", greetingCommand);

  console.info(`serving webhook on :${config.port}...`);
  botInstance.launch({
    webhook: {
      hookPath: "/",
      port: config.port
    }
  });

  console.info(`registering webhook on ${config.externalUrl}...`);

  return fetch(`https://api.telegram.org/bot${config.telegramToken}/setWebhook?url=${config.externalUrl}`).
    then((response) => {
      if (response.status !== 200) {
        botInstance.stop();

        return Promise.reject(new Error("error setting the webhook"));
      }

      console.info("webhook set successfully");

      return Promise.resolve(botInstance);
    });
};
