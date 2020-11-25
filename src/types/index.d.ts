import { Server } from 'socket.io';
import { Services } from 'lib/services';
import { Connection } from 'mysql2/promise';


declare global {
  namespace Express {
    interface Request {
      conn: Connection;
      services: Services;
      socketServer: Server;
    }
  }
}
