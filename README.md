# Alertmanager telegram bot

> Yet another Prometheus alertmanager's telegram bot

This is a work in progress, so take all functionalities with a grain of salt.

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Contributing](../CONTRIBUTING.md)

## About <a name = "about"></a>

A bot that uses some fancy features from telegram as inline keyboards and replies
to messages instead of the boring slash commands.

## Getting Started <a name = "getting_started"></a>

The bot expects two variables on the environment to run:

| variable name   | expected value                                                |
| --------------- | ------------------------------------------------------------- |
| TELEGRAM_ADMINS | comma-separated telegram user IDs, which the bot will talk to |
| TELEGRAM_TOKEN  | your bot token                                                |
| TEMPLATE_FILE   | template file path to use for messages                        |

### Prerequisites

If running locally, nodejs and yarn, and install all dependencies:

```shell
yarn install
```

Otherwise you can use docker:

```shell
docker build -t wwmoraes/alertmanager-telegram-bot .
```

### message template

For formatting messages the bot uses [doT](https://github.com/olado/doT) + a
linebreak replacement. You can provide a custom template file using the
environment variable `TEMPLATE_FILE`. All `br` HTML tags will be replaced by
linebreaks.

### using it as a module on another bot

The alertmanager logic is also available as a Telegraf module to be used on other
bots. You can do so with

```typescript
import { BotContext } from "alertmanager-telegram-bot/alertmanager/context";
import alertmanager from "alertmanager-telegram-bot/alertmanager/middleware";

const bot = new Telegraf<BotContext>("your-bot-token");

alertmanager.setupContext(bot);

bot.use(alertmanager.Middleware);
```

If you already have a bot context, extend it using the provided `BotContext`.

## Usage <a name = "usage"></a>

```shell
yarn start
```

OR

```shell
docker run --rm -it --env-file=.env -p 8443:8443 wwmoraes/alertmanager-telegram-bot
```

The bot itself is very straightforward, and does most of the actions using inline
keyboards. You can enroll yourself to receive the AM alerts using `/start` 😄
