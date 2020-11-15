import SocketManager from 'lib/socket/server';

export const grantSocketServer = (manager: SocketManager) => {
  return (req: any, _res?: any, next?: () => void) => {
    req.socketServer = manager.server;
    if (typeof next !== 'undefined') next();
  };
};
