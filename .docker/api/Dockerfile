FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ curl ffmpeg
COPY ./api/package*.json ./
COPY ./api/prisma ./prisma/
COPY ./api/prisma.config.ts ./
RUN npm ci
COPY ./api .
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y curl python3 make g++ ffmpeg
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/src ./src/
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/dist ./dist/
RUN npm ci --omit=dev
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate
COPY .docker/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD [ "npm", "run", "start:prod" ]
