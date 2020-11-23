import avaTest, { TestInterface } from 'ava';
import { PoolConnection, Pool } from 'mysql2/promise';
import { mapValues } from 'lodash';
import { v4 as uuid } from 'uuid';
import shell from 'shelljs';
import { Application } from 'express';

import { getServices, Services } from 'lib/services';
import settings from 'lib/settings';
import { createPool } from 'database/pool';
import { createTestApplication } from 'app';

interface CustomContext {
  services: Services;
  pool: Pool;
  connection: PoolConnection;
  testDbName: string;
  application: Application;
}

export const test = avaTest as TestInterface<CustomContext>;

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } = settings;

test.serial.before((t) => {
  // Create the pool for this process
  t.context.pool = createPool({
    host: DB_HOST,
    user: DB_USER,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    port: DB_PORT,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 40,
    queueLimit: 0,
  });
});

test.beforeEach(async (t) => {
  t.context.connection = await t.context.pool.getConnection();

  // Setup query formatting
  t.context.connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(
      /:(\w+)/g,
      function (txt, key) {
        // eslint-disable-next-line no-prototype-builtins
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this)
    );
  };

  const dbName = `${DB_NAME}-test-${uuid()}`;
  t.context.testDbName = dbName;

  // Create the DB for this test
  await t.context.connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
  );
  await t.context.connection.query(`USE \`${dbName}\``);

  shell.exec(`DB_NAME=${dbName} yarn db:migrate > /dev/null`);

  // Need cast here because `ServiceClass` is generic over all the services
  t.context.services = mapValues(
    getServices(),
    (ServiceClass) => new ServiceClass(t.context.connection)
  ) as Services;

  t.context.application = createTestApplication({
    services: t.context.services,
    connection: t.context.connection,
  });
});

test.afterEach(async (t) => {
  const { connection, testDbName } = t.context;

  await connection.query(`DROP DATABASE \`${testDbName}\``);
  connection.release();
});

test.after.always(async (t) => {
  await t.context.pool.end();
});
