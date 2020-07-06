.DEFAULT_GOAL := build

.PHONY: build shell run

build:
	docker build --build-arg BUILDKIT_INLINE_CACHE=1 --cache-from wwmoraes/alertmanager-telegram-bot -t wwmoraes/alertmanager-telegram-bot .

shell:
	docker run --rm -it --entrypoint=ash wwmoraes/alertmanager-telegram-bot

run:
	docker run --rm -it --env-file=.env -p 8443:8443 wwmoraes/alertmanager-telegram-bot
