FROM node:22-alpine AS builder
WORKDIR /app
COPY ./app/package*.json ./app/*.tgz ./
RUN npm i
COPY ./app .
COPY .docker/app/environment.production.ts ./src/environments/environment.production.ts
RUN npm run build:prod

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist/
RUN npm ci --omit=dev
COPY .docker/app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
