import { Server } from 'http';

import { Party, User } from '@app/lib/models';
import MessageService from '@app/lib/services/messages';
import UserService from '@app/lib/services/users';
import { Message, VideoEvent } from '@app/lib/types';
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
      [SocketEvents.URL_CHANGE, this.onURLChange],
      [SocketEvents.USER_LOADED, this.onUserLoad],
      [SocketEvents.VIDEO_EVENT, this.onSocketVideoEvent],
    ];
  }

  listen() {
    this.server.on('connection', async (socket) => {
      await UserService.create({
        socketId: socket.id,
      });

      console.log('socket', socket.id, 'connected');

      this.events.forEach(([event, handler]) => {
        socket.on(event, handler.bind(socket));
      });
    });
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
    ack: (data: { party: Party; user: User }) => void
  ) {
    const { party, user } = await UserService.joinParty({
      hash: data.partyHash,
      socketId: this.id,
    });

    this.join(party.hash, () =>
      ack({
        party,
        user,
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

  onURLChange(
    this: io.Socket,
    data: { partyHash: string, newUrl: string}
  ) {
    this.to(data.partyHash).emit(SocketEvents.URL_CHANGE, { data } );
  }
  
  onUserLoad(
    this: io.Socket,
    data: { partyHash: string }
  ) {
    this.to(data.partyHash).emit(SocketEvents.USER_LOADED, { data });
  }
  onSocketVideoEvent(
    this: io.Socket,
    data: VideoEvent,
  ) {
    this.to(data.partyHash).emit(SocketEvents.VIDEO_EVENT, data.eventData);
  }

}
