import http from 'http';

import settings from 'lib/settings';
import SocketManager from 'lib/socket/server';
import { createPool } from 'database/pool';
import { createApplication } from './app';

const main = () => {
  const connectionPool = createPool();

  const socketManager = new SocketManager({ connectionPool });

  const app = createApplication({
    connectionPool,
    socketManager,
  });

  const httpServer = http.createServer(app);

  const { PORT, STAGE } = settings;

  httpServer.listen(PORT, () => {
    console.log(`Server started in ${STAGE} mode. Listening on port ${PORT}`);
    socketManager.listen(httpServer);
  });
};

main();
