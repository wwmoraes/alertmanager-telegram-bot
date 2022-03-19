# Alertmanager telegram bot

> Yet another Prometheus alertmanager's telegram bot

[![GitHub license](https://img.shields.io/github/license/wwmoraes/alertmanager-telegram-bot)](https://github.com/wwmoraes/alertmanager-telegram-bot/blob/master/LICENSE)
[![GitHub top language](https://img.shields.io/github/languages/top/wwmoraes/alertmanager-telegram-bot)](https://github.com/wwmoraes/alertmanager-telegram-bot/search?l=typescript)
![GitHub repo size](https://img.shields.io/github/repo-size/wwmoraes/alertmanager-telegram-bot)
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/wwmoraes/alertmanager-telegram-bot)

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4130/badge)](https://bestpractices.coreinfrastructure.org/projects/4130)
[![GitHub last commit](https://img.shields.io/github/last-commit/wwmoraes/alertmanager-telegram-bot)](https://github.com/wwmoraes/alertmanager-telegram-bot/commits/master)
[![Build](https://github.com/wwmoraes/alertmanager-telegram-bot/workflows/Build/badge.svg)](https://github.com/wwmoraes/alertmanager-telegram-bot/actions)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=alert_status)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=security_rating)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=coverage)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=bugs)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=code_smells)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=wwmoraes_alertmanager-telegram-bot&metric=sqale_index)](https://sonarcloud.io/dashboard?id=wwmoraes_alertmanager-telegram-bot)

> WARNING: this project uses the old Telegraf v3 library, and won't be
> updated to v4.

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
