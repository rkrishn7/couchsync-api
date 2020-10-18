import { Server } from 'http';

import io from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export default class Manager {
  readonly server!: io.Server;
  readonly events!: [
    string,
    (data: Record<string, any>, ack?: (data: any) => void) => void
  ][];

  constructor(httpServer: Server) {
    this.server = io(httpServer);

    this.events = [
      ['disconnect', this.onSocketDisconnect],
      ['create_party', this.onSocketCreateParty],
    ];
  }

  listen() {
    this.server.on('connection', (socket) => {
      console.log('socket', socket.id, 'connected');
      this.events.forEach(([event, handler]) => {
        socket.on(event, handler.bind(socket));
      });
    });
  }

  onSocketDisconnect(this: io.Socket) {
    console.log('socket', this.id, 'disconnected');
  }

  onSocketCreateParty(
    this: io.Socket,
    ack: (data: { roomId: string }) => void
  ) {
    console.log('create room');
    const roomId = uuidv4();

    this.join(roomId, () =>
      ack({
        roomId,
      })
    );
  }
}
