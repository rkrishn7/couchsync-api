import { Server } from 'http';

import MessageService from '@app/lib/services/messages';
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
      ['send_message', this.onSocketSendMessage],
      ['get_messages', this.onSocketGetMessages],
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
    // TODO: delete from user table
    console.log('socket', this.id, 'disconnected');
  }

  onSocketCreateParty(
    this: io.Socket,
    ack: (data: { roomId: string }) => void
  ) {
    const roomId = uuidv4();

    this.join(roomId, () =>
      ack({
        roomId,
      })
    );
  }

  async onSocketSendMessage(this: io.Socket, data: any) {
    await MessageService.create(data);
    this.broadcast.emit('new_message', { message: data });
  }

  async onSocketGetMessages(
    this: io.Socket,
    data: { partyId: number },
    ack: (data: { messages: any[] }) => void
  ) {
    const { partyId } = data;
    const { messages } = await MessageService.search({ partyId });

    ack({
      messages,
    });
  }
}
