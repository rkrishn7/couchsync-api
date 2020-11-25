import * as express from 'express';
import { Server } from 'socket.io';
import { Services } from 'lib/services';
import { Connection } from 'mysql2/promise';

declare module 'express' {
  // @ts-ignore
  interface Request extends express.Request {
    conn: Connection;
    services: Services;
    socketServer: Server;
  }
}
