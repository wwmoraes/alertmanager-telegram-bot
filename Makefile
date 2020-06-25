.DEFAULT_GOAL := build

.PHONY: build shell run

build:
	docker build -t wwmoraes/alertmanager-telegram-bot .

shell:
	docker run --rm -it --entrypoint=ash wwmoraes/alertmanager-telegram-bot

run:
	docker run --rm -it --env-file=.env -p 8443:8443 wwmoraes/alertmanager-telegram-bot
