import avaTest, { TestInterface } from 'ava';
import { PoolConnection, Pool } from 'mysql2/promise';
import { Application } from 'express';

import { getServices } from 'lib/services';
import settings from 'lib/settings';
import { createPool } from 'database/pool';
import { createApplication } from 'app';
import SocketManager from 'lib/socket/server';

import { mapValues } from 'lodash';
import { v4 as uuid } from 'uuid';
import shell from 'shelljs';

// test cii
export interface CustomContext {
  services: any;
  pool: Pool;
  connection: PoolConnection;
  testDbName: string;
  app?: Application;
}

export const test = avaTest as TestInterface<CustomContext>;

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } = settings;

test.serial.before((t) => {
  t.context.pool = createPool({
    host: DB_HOST,
    user: DB_USER,
    port: DB_PORT as unknown as number,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 40,
    queueLimit: 0,
  });

  const socketManager = new SocketManager({ connectionPool: t.context.pool })

  t.context.app = createApplication({
    connectionPool: t.context.pool, 
    socketManager: socketManager,
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

  // Create the DB for this process
  await t.context.connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
  );
  await t.context.connection.query(`USE \`${dbName}\``);

  shell.exec(`DB_NAME=${dbName} yarn db:migrate`);

  t.context.services = mapValues(
    getServices(),
    (ServiceClass) => new ServiceClass(t.context.connection)
  );
});

test.afterEach(async (t) => {
  const { connection, testDbName } = t.context;

  await connection.query(`DROP DATABASE \`${testDbName}\``);
  connection.release();
});

test.after(async (t) => {
  await t.context.pool.end();
});
