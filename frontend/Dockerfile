FROM node:8

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN yarn install

EXPOSE 8080
CMD [ "yarn", "start"]
