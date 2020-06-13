export type Labels = { [label: string]: string };

export interface Alert {
  status: "resolved" | "firing",
  labels: Labels,
  annotations: Labels,
  startsAt: Date,
  endsAt: Date,
  generatorURL: string,
  fingerprint: string,
}

export interface AlertUpdate {
  version: string,
  groupKey: string,
  truncatedAlerts: number,
  status: "resolved" | "firing",
  receiver: string,
  groupLabels: Labels,
  commonLabels: Labels,
  commonAnnotations: Labels,
  externalURL?: string,
  alerts: Alert[],
}

export interface CallbackData {
  module: "am",
  do: "silence",
  params: { [key:string]: string }
}
