/**
 * @packageDocumentation
 * @module AlertManager
 */
/* eslint-disable no-process-env */
/* eslint-disable no-undef-init */
/* eslint-disable no-undefined */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-empty-function */

jest.mock("dotenv");
jest.mock("level-ts");

import {mkdtempSync, rmdirSync} from "fs";
import {tmpdir} from "os";
import {sep} from "path";

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

  process.env.ALERTMANAGER_DB_PATH = mkdtempSync(`${tmpdir()}${sep}alertmanager-`);
  process.env.ALERTS_DB_PATH = mkdtempSync(`${tmpdir()}${sep}alerts-`);
});

afterEach(() => {
  if (process.env.ALERTMANAGER_DB_PATH) {
    rmdirSync(process.env.ALERTMANAGER_DB_PATH, {recursive: true});
  }
  if (process.env.ALERTS_DB_PATH) {
    rmdirSync(process.env.ALERTS_DB_PATH, {recursive: true});
  }
});
it("should instantiate with disk DB", async () => {
  const {AlertManager} = await import("../AlertManager");

  const alertManagerInstance = new AlertManager(
    process.env.ALERTMANAGER_DB_PATH,
    process.env.ALERTS_DB_PATH
  );

  await expect(alertManagerInstance).toBeDefined();
  await expect(alertManagerInstance).toBeInstanceOf(AlertManager);
});
