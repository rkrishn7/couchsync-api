# couchsync API

[![Build Status](https://travis-ci.org/rkrishn7/couchsync-api.svg?branch=main)](https://travis-ci.org/rkrishn7/couchsync-api)
[![Coverage Status](https://coveralls.io/repos/github/rkrishn7/couchsync-api/badge.svg?branch=main)](https://coveralls.io/github/rkrishn7/couchsync-api?branch=main)

## Welcome

This repo hosts the necessary application server code for running the [couchsync](https://rkrishn7.github.io/couchsync/) chrome extension.

### Setting Up

First, you'll need to define a few environment variables. Copy and paste the following into a locally created `.env` file.

```sh
STAGE=dev
PORT=8000
DB_NAME=couchsync
DB_USER=root
DB_PASSWORD=password
DB_HOST=127.0.0.1
```

- Install dependencies by running `yarn`
- Create the dev database by running `yarn db:create`
- Start the docker containers by running `yarn docker:env`. This will build and run the mysql container
- Apply the database migrations by running `yarn db:migrate`

Run `yarn run:watch` to start the development server. We use [nodemon](https://www.npmjs.com/package/nodemon) to watch for file changes and reload the development server.

### Creating a Migration

To create a new migration file, run `yarn db:migrate:make <filename_without_extension>`.

### Reverting

To revert a specific migration, run `yarn db:migrate:revert <filename_without_extension>`. This will run the code in `exports.down`.
