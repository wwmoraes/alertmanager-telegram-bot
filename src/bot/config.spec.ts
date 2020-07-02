/* eslint-disable no-process-env */
/**
 * @packageDocumentation
 * @module Bot
 */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

jest.mock("dotenv");
jest.mock("node-fetch");

const configExportKeys = {
  externalUrl: "https://test.domain.com/",
  port: 0,
  telegramAdmins: "1",
  telegramToken: "TELEGRAM_TOKEN"
};

const configurationExports = {
  ...configExportKeys,
  "default": configExportKeys
};

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();

  process.env.EXTERNAL_URL = "https://test.domain.com/";
  process.env.TELEGRAM_TOKEN = "TELEGRAM_TOKEN";
  process.env.TELEGRAM_ADMINS = "1";
  process.env.PORT = "0";
});

it("should import successfully", () => {
  expect(import("./config")).resolves.toEqual(configurationExports);
});

it("should fail without telegram token", () => {
  delete process.env.TELEGRAM_TOKEN;

  expect(import("./config")).
    rejects.toThrowError("TELEGRAM_TOKEN is undefined");
});

it("should fail without telegram admins", () => {
  delete process.env.TELEGRAM_ADMINS;

  expect(import("./config")).
    rejects.toThrowError("TELEGRAM_ADMINS is undefined");
});

it("should fail without external URL", () => {
  delete process.env.EXTERNAL_URL;

  expect(import("./config")).
    rejects.toThrowError("EXTERNAL_URL is undefined");
});

it("should load with default port", () => {
  delete process.env.PORT;

  const expectedConfig = {
    ...configExportKeys,
    port: 8443,
    "default": {
      ...configExportKeys,
      port: 8443
    }
  };

  expect(import("./config")).resolves.toEqual(expectedConfig);
});
