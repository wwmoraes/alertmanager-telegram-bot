FROM node:14-alpine AS builder

WORKDIR /usr/local/bot/

COPY package.json yarn.lock tsconfig.json ./
RUN yarn install

COPY src ./src
RUN yarn build

RUN yarn install --prod

FROM node:14-alpine AS runner

RUN apk add --update --no-cache ca-certificates tini

RUN yarn install --prod

WORKDIR /opt/bot

RUN mkdir -p ./data/chats

COPY --from=builder /usr/local/bot/node_modules ./node_modules
COPY --from=builder /usr/local/bot/build ./

COPY default.tmpl .

VOLUME ["./data"]

EXPOSE 8443

ENTRYPOINT [ "tini", "node", "/opt/bot/index.js" ]
