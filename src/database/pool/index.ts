import settings, { DebugOptions } from '@app/lib/settings';
import mysql, { PoolOptions, Pool } from 'mysql2/promise';

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DEBUG } = settings;

const DEFAULT_POOL_OPTIONS: PoolOptions = {
  host: DB_HOST,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const createPool = (
  poolOptions: PoolOptions = DEFAULT_POOL_OPTIONS
): Pool => {
  const pool = mysql.createPool(poolOptions);

  pool.on('acquire', (connection) => {
    if (DEBUG === DebugOptions.DB_POOL) {
      console.log('Connection %d acquired', connection.threadId);
    }
  });

  pool.on('release', (connection) => {
    if (DEBUG === DebugOptions.DB_POOL) {
      console.log('Connection %d released', connection.threadId);
    }
  });

  return pool;
};
