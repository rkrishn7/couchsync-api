import { Socket } from 'socket.io';

type Middleware = (req: any, res: any, next: () => void) => void;

export const wrap = (middleware: Middleware) => (
  socket: Socket,
  next: () => void
) => middleware(socket.request, {}, next);
