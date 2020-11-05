import http from 'http';

import * as controllers from '@app/lib/controllers';
import settings from '@app/lib/settings';
import socketManager from '@app/lib/socket/server';
import { database } from '@app/lib/utils/middleware/database';
import bodyParser from 'body-parser';
import express from 'express';
import { values } from 'lodash';

const main = () => {
  const app = express();

  // Register middleware
  app.use(bodyParser.json());
  app.use(database);

  // Register routes
  values(controllers).forEach(({ path, router }) => app.use(path, router));

  const httpServer = http.createServer(app);

  const { PORT, STAGE } = settings;

  new socketManager(httpServer).listen();
  httpServer.listen(PORT, () =>
    console.log(`Server started in ${STAGE} mode. Listening on port ${PORT}`)
  );
};

main();
