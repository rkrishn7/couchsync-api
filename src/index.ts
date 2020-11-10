import http from 'http';

import bodyParser from 'body-parser';
import express from 'express';
import 'express-async-errors'; // version locked, need to audit when upgrading express
import * as controllers from 'lib/controllers';
import settings from 'lib/settings';
import socketManager from 'lib/socket/server';
import { database } from 'lib/utils/middleware/database';
import { errorHandler } from 'lib/utils/middleware/error';
import { values } from 'lodash';

const main = () => {
  const app = express();

  // Register middleware
  app.use(bodyParser.json());
  app.use(database);

  // Register routes
  values(controllers).forEach(({ path, router }) => app.use(path, router));

  app.use(errorHandler);

  const httpServer = http.createServer(app);

  const { PORT, STAGE } = settings;

  socketManager.listen(httpServer);
  httpServer.listen(PORT, () =>
    console.log(`Server started in ${STAGE} mode. Listening on port ${PORT}`)
  );
};

main();
