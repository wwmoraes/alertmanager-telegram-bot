import ngrok from "ngrok";
import fetch from "node-fetch";

import config from "../src/config";

console.info("connecting ngrok...");
ngrok.connect({
  addr: 8443,
  onLogEvent: console.debug
}).then((url) => {
  console.info(`ngrok running on ${url}`);
  console.info(`API URL at ${ngrok.getUrl()}`);
  console.info("registering webhook...");
  fetch(`https://api.telegram.org/bot${config.telegramToken}/setWebhook?url=${url}`).
    then(
      (response) =>
        console.info(response.status === 200
          ? "webhook set successfully"
          : "error setting the wehbook")
      , console.error
    );
}, console.error);
