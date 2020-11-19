import { Server } from 'socket.io';

export const grantSocketServer = (server: Server) => {
  return (req: any, _res?: any, next?: () => void) => {
    req.socketServer = server;
    if (typeof next !== 'undefined') next();
  };
};
