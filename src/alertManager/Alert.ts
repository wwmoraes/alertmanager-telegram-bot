/**
 * @packageDocumentation
 * @module AlertManager
 */

import type {IUpdateAlert} from "./typings/IAlertUpdate";
import {createHash} from "crypto";
import {readFileSync} from "fs";
import {template} from "dot";
import * as config from "./config";
import type {IAlert} from "./typings/IAlert";
import type {IAlertMatcher} from "./typings/IAlertMatcher";

/**
 * Alert instance
 *
 * @class Alert
 * @implements {IAlert}
 */
export class Alert implements IAlert {
  readonly baseUrl: string;

  readonly isFiring: boolean;

  readonly hash: string;

  readonly text: string;

  readonly silenceUrl: string;

  readonly relatedAlertsUrl: string;

  readonly matchers: { name: string; value: string; isRegex: boolean; }[];

  private static formatAlert =
    template(readFileSync(config.templatePath).toString());

  /**
   * check if an object is a valid [[IAlertUpdate]]
   *
   * @param {any} object object to check
   * @returns {boolean} alert update data
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static isIAlertUpdate (object: any): object is IUpdateAlert {
    return object &&
      typeof object.groupKey === "string" &&
      typeof object.status === "string" &&
      typeof object.receiver === "string" &&
      Array.isArray(object.alerts) &&
      typeof object.commonLabels === "object";
  }

  /**
   * check if an object is a valid [[IAlert]]
   *
   * @param {any} object object to check
   * @returns {boolean} alert data
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static isIAlert (object: any): object is IAlert {
    return typeof object !== "undefined" &&
    typeof object.baseUrl === "string" &&
    typeof object.isFiring === "boolean" &&
    typeof object.hash === "string" &&
    Array.isArray(object.matchers) &&
    object.matchers.every((matcher: IAlertMatcher) =>
      typeof matcher.isRegex === "boolean" &&
      typeof matcher.name === "string" &&
      typeof matcher.value === "string");
  }

  /**
   * creates an alert from an object that implements [[IAlertUpdate]]
   *
   * @param {any} object data to use to create the instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: IUpdateAlert): Alert;

  /**
   * creates an alert from an object that implements [[IAlert]]
   *
   * @param {any} object data to use to create the instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: IAlert): Alert;

  /**
   * creates an alert from the object passed, which must be implement [[IAlert]]
   *  or [[IAlertUpdate]]
   *
   * @param {any} object data to use to create the instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: any): Alert;

  /**
   * creates an alert from a given compatible object
   *
   * @param {any|IUpdateAlert|IAlert} object base data to create the alert from
   * @returns {Alert} alert instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: any|IUpdateAlert|IAlert): Alert {
    if (Alert.isIAlertUpdate(object)) {
      return Alert.fromUpdate(object);
    } else if (Alert.isIAlert(object)) {
      return Alert.fromData(object);
    }
    throw new Error("cannot create an alert from the provided object");
  }

  /**
   * creates an alert from an [[IAlertUpdate]]
   *
   * @param {IUpdateAlert} object data to create the alert from
   * @returns {Alert} alert instance
   */
  private static fromUpdate (object: IUpdateAlert): Alert {
    let baseUrl: string = config.externalUrl.toString();

    if (typeof object.externalURL !== "undefined" &&
    object.externalURL.indexOf(".") !== -1) {
      baseUrl = new URL(object.externalURL).toString();
    }

    const filter = Object.keys(object.commonLabels).map((key) =>
      `${key}="${object.commonLabels[key]}"`).
      join(",");

    const isFiring = object.status === "firing";
    const hash = createHash("md5").update(object.groupKey).
      digest("hex");
    const text = Alert.formatAlert(object).replace(
      /<br[ ]*\/?>/gu,
      "\r\n"
    );

    const encodedFilter = encodeURIComponent(`{${filter}}`);

    const silenceUrl = `${baseUrl}/#/silences/new?filter=${encodedFilter}`;
    const relatedAlertsUrl = `${baseUrl}/#/alerts?silenced=false&inhibited=false&active=true&filter=${encodedFilter}`;

    const matchers = Object.keys(object.commonLabels).map((key) =>
      ({
        isRegex: false,
        name: key,
        value: object.commonLabels[key]
      }));

    return new Alert({
      baseUrl,
      hash,
      isFiring,
      matchers,
      relatedAlertsUrl,
      silenceUrl,
      text
    });
  }

  /**
   * creates an alert from an [[IAlert]]
   *
   * @param {IAlert} object data to create the alert from
   * @returns {Alert} alert instance
   */
  private static fromData (object: IAlert): Alert {
    return new Alert(object);
  }

  /**
   * creates an alert instance from the data provided
   *
   * @param {IAlert} alertData data to create the alert from
   */
  private constructor (alertData: IAlert) {
    this.baseUrl = alertData.baseUrl;
    this.hash = alertData.hash;
    this.isFiring = alertData.isFiring;
    this.matchers = alertData.matchers;
    this.relatedAlertsUrl = alertData.relatedAlertsUrl;
    this.silenceUrl = alertData.silenceUrl;
    this.text = alertData.text;
  }
}
