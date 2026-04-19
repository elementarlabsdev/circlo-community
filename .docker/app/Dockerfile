FROM node:22-alpine

RUN apk add --no-cache gettext
RUN apk add --no-cache dos2unix

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app

COPY --chown=node:node ./app/package*.json ./app/*.tgz ./

RUN npm i

COPY --chown=node:node ./app .

RUN npm run build:prod

# COPY --chown=node:node .docker/app/environment.production.ts /environment.production.ts

RUN ./node_modules/.bin/ng config --global cli.analytics false

COPY --chown=node:node .docker/app/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/home/node/app/entrypoint.sh"]
