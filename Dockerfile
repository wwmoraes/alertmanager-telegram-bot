FROM node:14-alpine AS builder

WORKDIR /usr/local/bot/

COPY package.json yarn.lock tsconfig.json tsconfig.production.json ./
RUN yarn install --frozen-lockfile --link-duplicates --ignore-optional && \
  rm -rf \
  /usr/local/lib/node_modules \
  /usr/local/share/.cache

COPY src ./src
RUN yarn build -p tsconfig.production.json && \
  rm -rf src/ node_modules/ *.json *.lock


FROM node:14-alpine AS runner

WORKDIR /opt/bot

RUN apk add --update --no-cache ca-certificates tini

### Prepare user
RUN addgroup --gid 1001 bot \
  && adduser \
  --home /dev/null \
  --gecos "" \
  --shell /bin/false \
  --ingroup bot \
  --system \
  --disabled-password \
  --no-create-home \
  --uid 1001 \
  bot

RUN mkdir /opt/bot/data

COPY --chown=bot:bot package.json yarn.lock ./

RUN yarn install --prod --frozen-lockfile --link-duplicates --ignore-optional && \
  rm -rf \
  /usr/local/lib/node_modules \
  /usr/local/share/.cache \
  /opt/yarn*

### last-mile cleanups
RUN rm -rf \
  /tmp \
  /root

RUN chown -R bot:bot /opt/bot
USER bot

COPY --from=builder --chown=bot:bot /usr/local/bot/build ./

COPY --chown=bot:bot default.tmpl .

VOLUME ["/opt/bot/data"]

EXPOSE 8443

ENTRYPOINT [ "tini", "node", "/opt/bot/index.js" ]
