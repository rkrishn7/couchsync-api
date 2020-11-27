FROM node:12-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn db:migrate
CMD ["yarn", "run:prod"]
