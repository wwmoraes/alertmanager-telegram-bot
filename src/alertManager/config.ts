/* eslint-disable no-process-env */

export const alertManagerDbPath = process.env.ALERTMANAGER_DB_PATH ||
  "data/alertmanager";

export const alertsDbPath = process.env.ALERTS_DB_PATH ||
  "data/alerts";

export const internalUrl = process.env.INTERNAL_URL;

export const externalUrl = new URL(process.env.EXTERNAL_URL ||
  "http://127.0.0.1:9093");

export const templatePath = process.env.TEMPLATE_FILE ||
  "default.tmpl";

export default {
  alertManagerDbPath,
  alertsDbPath,
  internalUrl,
  externalUrl,
  templatePath
};
