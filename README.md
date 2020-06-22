# Alertmanager telegram bot

> Yet another Prometheus alertmanager's telegram bot

[![GitHub license](https://img.shields.io/github/license/wwmoraes/alertmanager-telegram-bot)](https://github.com/wwmoraes/alertmanager-telegram-bot/blob/master/LICENSE)
[![GitHub top language](https://img.shields.io/github/languages/top/wwmoraes/alertmanager-telegram-bot)](https://github.com/wwmoraes/alertmanager-telegram-bot/search?l=typescript)
![GitHub repo size](https://img.shields.io/github/repo-size/wwmoraes/alertmanager-telegram-bot)
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/wwmoraes/alertmanager-telegram-bot)

[![GitHub last commit](https://img.shields.io/github/last-commit/wwmoraes/alertmanager-telegram-bot)](https://github.com/wwmoraes/alertmanager-telegram-bot/commits/master)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/wwmoraes/alertmanager-telegram-bot/DockerHub)](https://github.com/wwmoraes/alertmanager-telegram-bot/actions?query=workflow%3ADockerHub)

[![Maintainability](https://api.codeclimate.com/v1/badges/3423bf84a8f2cc9afdea/maintainability)](https://codeclimate.com/github/wwmoraes/alertmanager-telegram-bot/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3423bf84a8f2cc9afdea/test_coverage)](https://codeclimate.com/github/wwmoraes/alertmanager-telegram-bot/test_coverage)
[![Code Climate issues](https://img.shields.io/codeclimate/issues/wwmoraes/alertmanager-telegram-bot)](https://codeclimate.com/github/wwmoraes/alertmanager-telegram-bot/issues)

This is a work in progress, so take all functionalities with a grain of salt.

You can also [jump directly to the docs](http://wwmoraes.github.io/alertmanager-telegram-bot).

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Contributing](../CONTRIBUTING.md)

## About <a name = "about"></a>

A bot that uses some fancy features from telegram as inline keyboards and replies
to messages instead of the boring slash commands.

## Getting Started <a name = "getting_started"></a>

You can setup the bot using those environment variables:

| variable             | default                 | description                                                                               |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| TELEGRAM_ADMINS      | `undefined`             | comma-separated telegram user IDs, which the bot will talk to                             |
| TELEGRAM_TOKEN       | `undefined`             | your bot token                                                                            |
| TEMPLATE_FILE        | `default.tmpl`          | template file path to use for messages                                                    |
| EXTERNAL_URL         | `http://127.0.0.1:9093` | endpoint to register the webhook on Telegram (useful for reversed-proxy deployments)      |
| INTERNAL_URL         | `undefined`             | alertmanager URL to send API requests (default: uses `externalURL` provided on the alert) |
| ALERTMANAGER_DB_PATH | `data/alertmanager`     | database path for alertmanager graph storage (LevelGraph)                                 |
| ALERTS_DB_PATH       | `data/alerts`           | database path for alert storage (LevelDB)                                                 |

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
linebreak replacement. You can provide a custom template file by mounting your file
as a volume + setting the path on `TEMPLATE_FILE`. All `br` HTML tags will be
replaced by line breaks.

### using it as a module on another bot

The alertmanager logic is also available as a Telegraf module to be used on other
bots. You can do so with

```typescript
import {
  AlertManagerContext,
  AlertManagerMiddleware,
  setupAlertManagerContext,
} from "./AlertManager";

interface YourBotContext extends AlertManagerContext {}

const bot = new Telegraf<YourBotContext>("your-bot-token");

setupAlertManagerContext(bot);

bot.use(AlertManagerMiddleware);
```

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

### Slash commands

The alertmanager middleware uses no slash commands, and instead automatically
registers the given user IDs to receive notifications.

If using the full bot from this repository, then you can use:

- `/start` - registers yourself to receive the alerts
- `/help` - well, halp 😂

It also responds to `hi` and stickers as a "health check".
