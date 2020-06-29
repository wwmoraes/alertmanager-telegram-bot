/**
 * @packageDocumentation
 * @module AlertManager
 */

import {IAlertUpdate} from "./IAlertUpdate";
import {createHash} from "crypto";
import {readFileSync} from "fs";
import {template} from "dot";
import * as config from "./config";
import {IAlert} from "./IAlert";

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
   * @param {any} object object to check
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static isIAlertUpdate (object: any): object is IAlertUpdate {
    return object &&
      typeof object.groupKey === "string" &&
      typeof object.status === "string" &&
      typeof object.receiver === "string" &&
      Array.isArray(object.alerts) &&
      typeof object.commonLabels === "object";
  }

  /**
   * check if an object is a valid [[IAlert]]
   * @param {any} object object to check
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static isIAlert (object: any): object is IAlert {
    return object &&
      object.baseUrl instanceof URL &&
      typeof object.hash === "string" &&
      typeof object.isFiring === "string" &&
      Array.isArray(object.matchers) &&
      typeof object.relatedAlertsUrl === "string" &&
      typeof object.silenceUrl === "string" &&
      typeof object.text === "string";
  }

  /**
   * creates an alert from an object that implements [[IAlertUpdate]]
   * @param {any} object data to use to create the instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: IAlertUpdate): Alert;

  /**
   * creates an alert from an object that implements [[IAlert]]
   * @param {any} object data to use to create the instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: IAlert): Alert;

  /**
   * creates an alert from the object passed, which must be implement [[IAlert]]
   *  or [[IAlertUpdate]]
   * @param {any} object data to use to create the instance
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: any): Alert;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  public static from (object: any|IAlertUpdate|IAlert): Alert {
    if (Alert.isIAlertUpdate(object)) {
      return Alert.fromUpdate(object);
    } else if (Alert.isIAlert(object)) {
      return Alert.fromData(object);
    }
    throw new Error("cannot create an alert from the provided object");
  }

  private static fromUpdate (object: IAlertUpdate): Alert {
    if (typeof object.groupKey === "undefined") {
      throw Error("no groupKey defined on update");
    }
    if (typeof object.status === "undefined") {
      throw Error("no status defined on update");
    }
    if (typeof object.receiver === "undefined") {
      throw Error("no receiver defined on update");
    }

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

  private static fromData (object: IAlert): Alert {
    return new Alert(object);
  }

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
