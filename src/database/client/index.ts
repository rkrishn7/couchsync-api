import settings, { DebugOptions } from '@app/lib/settings';
import mysql from 'mysql2/promise';

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DEBUG } = settings;

let CONNECTION_POOL_COUNT = 0;

const pool = mysql.createPool({
  host: DB_HOST,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('acquire', (connection) => {
  if (DEBUG === DebugOptions.DB_POOL) {
    console.log('Connection %d acquired', connection.threadId);
    console.log('CONNECTION POOL COUNT (%d)', ++CONNECTION_POOL_COUNT);
  }
});

pool.on('release', (connection) => {
  if (DEBUG === DebugOptions.DB_POOL) {
    console.log('Connection %d released', connection.threadId);
    console.log('CONNECTION POOL COUNT (%d)', --CONNECTION_POOL_COUNT);
  }
});

/*
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGHUP', 'SIGUSR2', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, async () => {
    try {
      await pool.end();
    } catch (e) {
      throw new Error('Could not close pending connections');
    }
  });
});
*/

export default pool;
