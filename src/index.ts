import http from 'http';

import settings from '@app/lib/settings';
import socketManager from '@app/lib/socket/server';

const main = () => {
  const httpServer = http.createServer((req, res) => {
    console.log('hello');
  });

  new socketManager(httpServer).listen();

  httpServer.listen(settings.PORT, () => {
    console.log('server listening on port', settings.PORT);
  });
};

main();
