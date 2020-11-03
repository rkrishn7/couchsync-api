# playback_sync_api

## Server

### `yarn run:watch`

**Make sure you configure your `.env` before running**

For development mode:

```
PORT=8000
STAGE=dev
```

Runs the development server in watch mode. When you make a change to the code, the server will restart.

## Database

We're using [db-migrate](https://db-migrate.readthedocs.io/en/latest/) to manage database migrations. Migrations can be found in `src/database/migrations`.

Make sure you have the following in your `.env`

```
DB_NAME
DB_USERNAME
DB_PASSWORD
```

### Creating the Database

To create the database, run `yarn db:create`.

### Creating a Migration

To create a new migration file, run `yarn db:migrate:make <filename_without_extension>`

### Reverting

To revert a specific migration, run `yarn db:migrate:revert <filename_without_extension>`. This will run the code in `exports.down`

### Running Migrations

To run the latest migrations, run `yarn db:migrate`
