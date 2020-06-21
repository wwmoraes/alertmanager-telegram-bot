/* eslint-disable no-process-env */

export const internalUrl = process.env.INTERNAL_URL;
export const externalUrl = new URL(process.env.EXTERNAL_URL ||
  "http://127.0.0.1:9093");
export const templatePath = process.env.TEMPLATE_FILE ||
  "default.tmpl";

export default {
  internalUrl,
  externalUrl,
  templatePath
};
