/**
 * @packageDocumentation
 * @module AlertManager
 */

import {AlertUpdate} from "./interfaces";
import {Update} from "telegraf/typings/telegram-types";
import {createHash} from "crypto";
import {readFileSync} from "fs";
import {template} from "dot";
import * as config from "./config";

export class Alert {
  private static formatAlert =
    template(readFileSync(config.templatePath).toString());

  private readonly alertData: AlertUpdate;

  private readonly filter: string;

  public readonly baseUrl: URL;

  public readonly isFiring: boolean;

  public readonly hash: string;

  public readonly text: string;

  public readonly silenceUrl: string;

  public readonly relatedAlertsUrl: string;

  public readonly matchers: { name: string, value: string, isRegex: boolean }[];

  constructor (update: Update) {
    this.alertData = (update as unknown) as AlertUpdate;

    if (typeof this.alertData.groupKey === "undefined") {
      throw Error("no groupKey defined on update");
    }
    if (typeof this.alertData.status === "undefined") {
      throw Error("no status defined on update");
    }
    if (typeof this.alertData.receiver === "undefined") {
      throw Error("no receiver defined on update");
    }

    if (typeof this.alertData.externalURL === "undefined" ||
      this.alertData.externalURL.indexOf(".") === -1) {
      this.baseUrl = config.externalUrl;
    } else {
      this.baseUrl = new URL(this.alertData.externalURL);
    }

    this.filter = Object.keys(this.alertData.commonLabels).map((key) =>
      `${key}="${this.alertData.commonLabels[key]}"`).
      join(",");

    this.isFiring = this.alertData.status === "firing";
    this.hash = createHash("md5").update(this.alertData.groupKey).
      digest("hex");
    this.text = Alert.formatAlert(this.alertData).replace(
      /<br[ ]*\/?>/gu,
      "\r\n"
    );
    this.silenceUrl = `${this.baseUrl}/#/silences/new?filter=${encodeURIComponent(`{${this.filter}}`)}`;
    this.relatedAlertsUrl = `${this.baseUrl}/#/alerts?silenced=false&inhibited=false&active=true&filter=${encodeURIComponent(`{${this.filter}}`)}`;

    this.matchers = Object.keys(this.alertData.commonLabels).map((key) =>
      ({
        "isRegex": false,
        "name": key,
        "value": this.alertData.commonLabels[key]
      }));
  }
}
