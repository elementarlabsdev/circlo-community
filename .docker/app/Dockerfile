FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++
COPY ./app/package*.json ./app/*.tgz ./
RUN npm ci
COPY ./app .
COPY .docker/app/environment.production.ts ./src/environments/environment.production.ts
RUN npm run build:prod

FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/*.tgz ./
COPY --from=builder /app/dist ./dist/
RUN npm ci --omit=dev
COPY .docker/app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
