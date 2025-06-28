FROM node:22-alpine

WORKDIR /node-app

COPY package.json package-lock.json ./

COPY . .
#RUN cp .env.example .env

ENTRYPOINT ["npm", "start"]