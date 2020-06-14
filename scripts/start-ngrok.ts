import ngrok from 'ngrok';
import fetch from 'node-fetch';

require('dotenv').config();

if (process.env.TELEGRAM_TOKEN === undefined) {
  console.error("TELEGRAM_TOKEN is undefined");
  process.exit(2);
}

console.log('connecting ngrok...');
ngrok.connect({
  addr: 8443,
  onLogEvent: console.log
}).then(url => {
  console.log(`ngrok running on ${url}`);
  console.log(`API URL at ${ngrok.getUrl()}`);
  console.log('registering webhook...');
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook?url=${url}`)
  .then(response =>
    console.log(
      response.status === 200
      ? "webhook set successfully"
      : "error setting the wehbook"
      )
    , console.error);
}, console.error);
