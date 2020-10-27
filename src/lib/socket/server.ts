import { Server } from 'http';

import MessageService from '@app/lib/services/messages';
import UserService from '@app/lib/services/users';
import { Message } from '@app/lib/types';
import io from 'socket.io';

import { SocketEvents } from './events';

export default class Manager {
  readonly server!: io.Server;
  readonly events!: [
    string,
    (data: Record<string, any>, ack?: (data: any) => void) => void
  ][];

  constructor(httpServer: Server) {
    this.server = io(httpServer);

    this.events = [
      [SocketEvents.DISCONNECT, this.onSocketDisconnect],
      [SocketEvents.JOIN_PARTY, this.onSocketJoinParty],
      [SocketEvents.SEND_MESSAGE, this.onSocketSendMessage],
      [SocketEvents.GET_MESSAGES, this.onSocketGetMessages],
    ];
  }

  listen() {
    this.server.on('connection', (socket) => {
      // Persist the new user
      UserService.create({
        socketId: socket.id,
      });

      console.log('socket', socket.id, 'connected');

      this.events.forEach(([event, handler]) => {
        socket.on(event, handler.bind(socket));
      });
    });
  }

  applyMiddleware(socket: io.Socket) {
    // For client
    /*socket.use((packet, next) => {
      // packet[1] is the packet data
      if (packet[1]) {
        console.log('data', packet[1]);
        packet[1] =

      }
    })*/
  }

  async onSocketDisconnect(this: io.Socket) {
    console.log('socket', this.id, 'disconnected');
    await UserService.deactivate({
      socketId: this.id,
    });
  }

  async onSocketJoinParty(
    this: io.Socket,
    data: { partyHash: string },
    ack: (data: { party: any }) => void
  ) {
    const party = await UserService.joinParty({
      hash: data.partyHash,
      socketId: this.id,
    });

    this.join(party.hash, () =>
      ack({
        party,
      })
    );
  }

  async onSocketSendMessage(
    this: io.Socket,
    data: Message,
    ack: (data: { message: any }) => void
  ) {
    const message = await MessageService.create({
      socketId: this.id,
      ...data,
    });
    this.to(data.partyHash).emit(SocketEvents.NEW_MESSAGE, { message });

    ack({
      message,
    });
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
