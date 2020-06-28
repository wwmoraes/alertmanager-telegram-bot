/**
 * Bot instance safe factory
 * @packageDocumentation
 * @module Bot
 */

import {Telegraf} from "telegraf";
import fetch from "node-fetch";

import {BotContext} from "./BotContext";
import {startCommand} from "./startCommand";
import {helpCommand} from "./helpCommand";
import {stickerCommand} from "./stickerCommand";
import {greetingCommand} from "./greetingCommand";

import {setupAlertManagerContext, alertManagerComposer} from "../alertManager";
import {userOnlyMiddleware} from "../userOnly";

/**
 * safely creates the bot instance
 * @returns {Promise<Telegraf<BotContext>>} bot instance
 */
export const bot = async (): Promise<Telegraf<BotContext>|undefined> => {
  // eslint-disable-next-line init-declarations,no-undef-init,no-undefined
  let botInstance: Telegraf<BotContext> | undefined = undefined;

  try {
    const config = await import("./config");

    botInstance = new Telegraf<BotContext>(
      config.telegramToken,
      {telegram: {webhookReply: false}}
    );

    botInstance.context.userIds = config.telegramAdmins.split(",");

    console.info("setting up alert manager context...");
    await setupAlertManagerContext(botInstance);

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
    botInstance.startWebhook(
      "/",
      null,
      config.port
    );

    console.info(`registering webhook on ${config.externalUrl}...`);

    await fetch(`https://api.telegram.org/bot${config.telegramToken}/setWebhook?url=${config.externalUrl}`).
      then((response) => {
        if (response.status !== 200) {
          throw new Error("error setting the webhook");
        }

        console.info("webhook set successfully");
      });
  } catch (error) {
    if (typeof botInstance !== "undefined") {
      botInstance.stop();
    }

    console.error("failed to create a bot instance");

    return Promise.reject(error);
  }

  return Promise.resolve(botInstance);
};
