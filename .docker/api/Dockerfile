FROM node:22-alpine AS builder
WORKDIR /app
COPY ./api/package*.json ./
COPY ./api/prisma ./prisma/
RUN npm ci
COPY ./api .
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/dist ./dist/
RUN npm ci --omit=dev
COPY .docker/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD [ "npm", "run", "start:prod" ]
