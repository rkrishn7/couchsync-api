import { Server } from 'http';

import { useFourStackItems } from '@bitauth/libauth';
import io from 'socket.io';
import { adjectives, animals, Config, uniqueNamesGenerator } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';

export default class Manager {
  readonly server!: io.Server;
  readonly events!: [
    string,
    (data: Record<string, any>, ack?: (data: any) => void) => void
  ][];
  users!: {
    [userId: string]: [
      string,  // username
      string,  // user image
    ]    
  };

  constructor(httpServer: Server) {
    this.server = io(httpServer);

    this.events = [
      ['disconnect', this.onSocketDisconnect],
      ['create_party', this.onSocketCreateParty],
    ];

    this.users = {};
   
  }

  listen() {
    this.server.on('connection', (socket) => {
      console.log('socket', socket.id, 'connected');

      this.users[socket.id] = [this.generateNewName(), "img"]; 

      this.events.forEach(([event, handler]) => {
        socket.on(event, handler.bind(socket));
      });
    });
  }

  generateNewName() {

    const takenSet = this.getTakenNames()

    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals], 
      length: 2
    });

    return randomName;
  }

  getTakenNames(): Set<string> {
    return new Set<string>();
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
