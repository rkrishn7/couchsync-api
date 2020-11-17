import { Server } from 'http';

import { Message, VideoEvent } from 'lib/types';
import { database } from 'lib/utils/middleware/database';
import io, { Socket } from 'socket.io';

import { SocketEvents } from './events';

class Manager {
  server!: io.Server;
  readonly events!: [
    string,
    (data: Record<string, any>, ack?: (data: any) => void) => void
  ][];

  constructor() {
    this.events = [
      [SocketEvents.DISCONNECT, this.onSocketDisconnect],
      [SocketEvents.JOIN_PARTY, this.onSocketJoinParty],
      [SocketEvents.SEND_MESSAGE, this.onSocketSendMessage],
      [SocketEvents.URL_CHANGE, this.onURLChange],
      [SocketEvents.VIDEO_EVENT, this.onSocketVideoEvent],
    ];
  }

  async grantServices(socket: Socket, work: any) {
    try {
      await database(socket.request);
      await work();
    } finally {
      if (socket.request.conn) await socket.request.conn.release();
    }
  }

  listen(http: Server) {
    this.server = io(http);
    this.server.on('connection', async (socket) => {
      console.log('socket', socket.id, 'connected');

      this.grantServices(socket, async () => {
        await socket.request.services.users.create({
          socketId: socket.id,
        });

        this.events.forEach(([event, handler]) => {
          socket.on(event, (data, ack) => {
            this.grantServices(socket, async () => {
              return handler.call(socket, data, ack);
            });
          });
        });
      });
    });
  }

  async onSocketDisconnect(this: io.Socket) {
    console.log('socket', this.id, 'disconnected');
    const { newHost, user } = await this.request.services.users.deactivate({
      socketId: this.id,
    });

    if (user.party?.hash)
      this.to(user.party.hash).emit(SocketEvents.USER_LEFT_PARTY, { user });
    if (newHost) {
      // TODO: Find an actual way to send a system message
      const newHostMessage = {
        user: {
          name: 'couchsync',
          avatarUrl: 'https://avatars.dicebear.com/api/bottts/couchs.svg',
        },
        content: `${newHost.name} has been promoted to the host!`,
        id: 0,
        userId: 0,
      };
      this.in(user.party.hash).emit(SocketEvents.NEW_MESSAGE, {
        message: newHostMessage,
      });
      this.in(user.party.hash).emit(SocketEvents.NEW_HOST, { user: newHost });
    }
  }

  async onSocketJoinParty(
    this: io.Socket,
    data: { partyHash: string },
    ack: (data: { party: any; user: any }) => void
  ) {
    const { user } = await this.request.services.users.joinParty({
      hash: data.partyHash,
      socketId: this.id,
    });

    this.join(user.party.hash, () =>
      ack({
        party: user.party,
        user,
      })
    );

    this.to(user.party.hash).emit(SocketEvents.USER_JOINED_PARTY, { user });
  }

  async onSocketSendMessage(
    this: io.Socket,
    data: Message,
    ack: (data: { message: any }) => void
  ) {
    const message = await this.request.services.messages.create({
      socketId: this.id,
      ...data,
    });
    this.to(data.partyHash).emit(SocketEvents.NEW_MESSAGE, { message });

    ack({
      message,
    });
  }

  async onSocketVideoEvent(this: io.Socket, data: VideoEvent) {
    this.to(data.partyHash).emit(SocketEvents.VIDEO_EVENT, data.eventData);
  }

  async onURLChange(this: io.Socket,data: { partyHash: string, newUrl: string}) {
    await this.request.services.party.updatePartyDetails({
      partyHash: data.partyHash},
      {watchUrl: data.newUrl}
    );
    const newUrlMessage = {
      user: {
        name: 'couchsync',
        avatarUrl: 'https://avatars.dicebear.com/api/bottts/couchs.svg',
      },
      content: `Host is navigating to new video!`,
      id: 0,
      userId: 0,
    };
    this.in(data.partyHash).emit(SocketEvents.NEW_MESSAGE, {
      message: newUrlMessage,
    });
    this.to(data.partyHash).emit(SocketEvents.URL_CHANGE, { data } );
  }

  /*
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
  */
}

export default new Manager();
