import {readFileSync} from "fs";
import {template} from "dot";
import {join} from "path";

const templateData = {
  alerts: [
    {
      status: "firing",
      startsAt: new Date().toISOString()
    },
    {
      status: "resolved",
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString()
    }
  ],
  commonLabels: {
    alertname: "ALERT_NAME",
    instance: "INSTANCE",
    service: "SERVICE",
    severity: "SEVERITY"
  },
  commonAnnotations: {
    summary: "SUMMARY",
    message: "SUMMARY",
    description: "SUMMARY"
  }
};

const templateFilePath = join(__dirname, "../default.tmpl");

console.debug("reading template...");
const templateRender = template(readFileSync(templateFilePath).toString());

console.debug("rendering template...");
console.debug(templateRender(templateData).replace(/<br[ ]*\/?>/gu, "\r\n"));
