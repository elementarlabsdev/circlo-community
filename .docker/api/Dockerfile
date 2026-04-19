FROM node:22

WORKDIR /app

COPY ./api/package.json ./
COPY ./api/prisma ./prisma/

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN npm i

COPY ./api .

COPY .docker/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN npx prisma generate
RUN npm run build

ENTRYPOINT [ "./entrypoint.sh" ]
CMD [ "npm", "run", "start:prod" ]
