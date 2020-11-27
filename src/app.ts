import bodyParser from 'body-parser';
import express, { Application } from 'express';
import 'express-async-errors'; // version locked, need to audit when upgrading express
import { values } from 'lodash';
import { Pool } from 'mysql2/promise';

import * as controllers from 'lib/controllers';
import { grantConnection } from 'lib/utils/middleware/database';
import { errorHandler } from 'lib/utils/middleware/error';
import SocketManager from 'lib/socket/server';
import { grantSocketServer } from 'lib/utils/middleware/socket-server';

interface ApplicationOptions {
  connectionPool: Pool;
  socketManager: SocketManager;
}

export const createApplication = ({
  connectionPool,
  socketManager,
}: ApplicationOptions): Application => {
  const app = express();

  app.use(bodyParser.json());
  // Grant a database connection to this request
  app.use(grantConnection(connectionPool));
  app.use(grantSocketServer(socketManager.server));

  // Register routes
  values(controllers).forEach(({ path, router }) => app.use(path, router));

  app.use(errorHandler);

  return app;
};

export const createTestApplication = ({
  connection,
  services,
}: any): Application => {
  const app = express();

  app.use(bodyParser.json());
  // Grant a database connection to this request
  app.use((req: any, _res?: any, next?: () => void) => {
    req.conn = connection;
    req.services = services;
    req.socketServer = new SocketManager({ connectionPool: {} as any });

    next();
  });

  // Register routes
  values(controllers).forEach(({ path, router }) => app.use(path, router));

  app.use(errorHandler);

  return app;
};
