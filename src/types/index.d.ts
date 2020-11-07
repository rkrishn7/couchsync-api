import * as express from 'express';
import { Services } from 'lib/services';
import { Connection } from 'mysql2/promise';

declare module 'express' {
  interface Request extends express.Request {
    conn: Connection;
    services: Services;
  }
}
