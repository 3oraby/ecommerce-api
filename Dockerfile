FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apk add --no-cache netcat-openbsd

COPY . .

RUN chmod +x docker/entrypoint.sh
RUN chmod +x docker/wait-for-db.sh

EXPOSE 3000

ENTRYPOINT ["sh", "docker/entrypoint.sh"]