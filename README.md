# Alertmanager telegram bot

> Yet another Prometheus alertmanager's telegram bot

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

| variable name  | expected value                                 |
|----------------|------------------------------------------------|
| TELEGRAM_ADMIN | a telegram user ID, which the bot will talk to |
| TELEGRAM_TOKEN | your bot token                                 |

### Prerequisites

If running locally, nodejs and yarn, and install all dependencies:

```shell
yarn install
```

Otherwise you can use docker:

```shell
docker build -t wwmoraes/alertmanager-telegram-bot .
```

## Usage <a name = "usage"></a>

```shell
yarn start
```

OR

```shell
docker run --rm -it --env-file=.env -p 8443:8443 wwmoraes/alertmanager-telegram-bot
```
