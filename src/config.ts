/* eslint-disable no-process-env */

import dotenv from "dotenv";

dotenv.config();

if (typeof process.env.TELEGRAM_TOKEN === "undefined") {
  throw new Error("TELEGRAM_TOKEN is undefined");
}

if (typeof process.env.TELEGRAM_ADMINS === "undefined" ||
    process.env.TELEGRAM_ADMINS.length === 0) {
  throw new Error("TELEGRAM_ADMINS is undefined");
}

export const telegramToken = process.env.TELEGRAM_TOKEN;
export const telegramAdmins = process.env.TELEGRAM_ADMINS;
export const externalUrl = process.env.EXTERNAL_URL;
export const port = 8443;

export default {
  telegramToken,
  telegramAdmins,
  externalUrl,
  port
};
