/**
 * @packageDocumentation
 * @module Bot
 */
/* global process */
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

if (typeof process.env.EXTERNAL_URL === "undefined") {
  throw new Error("EXTERNAL_URL is undefined");
}

export const telegramToken = process.env.TELEGRAM_TOKEN;
export const telegramAdmins = process.env.TELEGRAM_ADMINS;
export const externalUrl = process.env.EXTERNAL_URL;
export const port = parseInt(process.env.PORT || "8443", 10);

export default {
  telegramToken,
  telegramAdmins,
  externalUrl,
  port
};
