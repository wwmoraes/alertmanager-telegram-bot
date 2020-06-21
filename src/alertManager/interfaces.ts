/**
 * @packageDocumentation
 * @module AlertManager
 */

import {Update} from "telegraf/typings/telegram-types";

export type Labels = { [label: string]: string };

export interface AlertInfo {
  status: "resolved" | "firing",
  labels: Labels,
  annotations: Labels,
  startsAt: Date,
  endsAt: Date,
  generatorURL: string,
  fingerprint: string,
}

export interface AlertUpdate extends Update {
  version: string,
  groupKey: string,
  truncatedAlerts: number,
  status: "resolved" | "firing",
  receiver: string,
  groupLabels: Labels,
  commonLabels: Labels,
  commonAnnotations: Labels,
  externalURL?: string,
  alerts: AlertInfo[],
}

export interface AlertManagerUrls {
  baseUrl: string,
  silenceUrl: string,
  relatedAlertsUrl: string,
}

export interface CallbackData extends Record<string, unknown> {
  module: "am",
  do: "silence",
  params: { [key:string]: string }
}
