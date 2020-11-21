# couchsync API

## Welcome

This repo hosts the necessary application server code for running the [couchsync](https://rkrishn7.github.io/couchsync/) chrome extension.

### Setting Up

- Install dependencies by running `yarn`
- Create the dev database by running `yarn db:create`
- Apply the database migrations by running `yarn db:migrate`

In order to run the server, you'll need to define a few environment variables. Copy and paste the following into a locally created `.env` file.

```sh
STAGE=dev
PORT=8000
DB_NAME=couchsync
DB_USER=root
DB_PASSWORD=password
DB_HOST=localhost
```

Run `yarn run:watch` to start the development server. We use [nodemon](https://www.npmjs.com/package/nodemon) to watch for file changes and reload the development server.

### Creating a Migration

To create a new migration file, run `yarn db:migrate:make <filename_without_extension>`.

### Reverting

To revert a specific migration, run `yarn db:migrate:revert <filename_without_extension>`. This will run the code in `exports.down`.
