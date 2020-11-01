# playback_sync_api

## Server

### `yarn run:watch`

Runs the development server in watch mode. When you make a change to the code, the server will restart.

## Database

We're using [db-migrate](https://db-migrate.readthedocs.io/en/latest/) to manage database migrations. Migrations can be found in `src/database/migrations`.

Make sure you have the following in your `.env`

```
DB_NAME
DB_USER
DB_PASSWORD
```

And in `prisma/.env`

```
DATABASE_URL
```

### Creating the Database

To create the database, run `yarn db:create`.

### Creating a Migration

To create a new migration file, run `yarn db:migrate:make <filename_without_extension>`

### Reverting

To revert a specific migration, run `yarn db:migrate:revert <filename_without_extension>`. This will run the code in `exports.down`

### Running Migrations

To run the latest migrations, run `yarn db:migrate`

Some helpful resources for Prisma:

- https://github.com/prisma/docs/issues/800
