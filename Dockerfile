FROM node:14

WORKDIR /usr/src/app

COPY .eslintrc.json jest.config.ts package.json tsconfig.json yarn.lock ./
RUN yarn

COPY src src
RUN yarn lint && yarn build && yarn test

COPY README.md ./
