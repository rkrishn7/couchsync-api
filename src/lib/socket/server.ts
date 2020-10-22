import { Server } from 'http';

//import { isPayToScriptHash } from '@bitauth/libauth';
// import { useFourStackItems } from '@bitauth/libauth';
import io from 'socket.io';
// import { adjectives, animals, Config, uniqueNamesGenerator } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';

interface User {
  userId: string,
  userName: string,
  image: string,
}

interface Room {
  users: User[],
  host: string,
}

export default class Manager {
  readonly server!: io.Server;
  readonly events!: [
    string,
    (data: Record<string, any>, ack?: (data: any) => void) => void
  ][];
  private rooms: { [roomId: string]: Room };

  constructor(httpServer: Server) {
    this.server = io(httpServer);

    this.events = [
      ['disconnect', this.onSocketDisconnect],
      ['create_party', this.onSocketCreateParty],
    ];

    this.rooms = {};
  }

  listen() {
    this.server.on('connection', (socket) => {

      console.log('User', socket.id, 'connected');

      // console.log(this.u);
      // console.log(this.host);

      this.events.forEach(([event, handler]) => {
        socket.on(event, handler.bind(this, socket));
      });
    });
  }

  onSocketDisconnect(sock: io.Socket) {
    this.removeUser(sock);
    console.log('socket', sock.id, 'disconnected');
  }

  removeUser(sock: io.Socket): void {
    if (Object.keys(sock.rooms).length !== 0) {
      const roomId: string = sock.rooms[sock.rooms.keys[0]]; // assuming a user can only be in one room at a time
      this.rooms[roomId].users = this.rooms[roomId].users.filter((user, index, array) => {
        return user.userId != sock.id;
      });

      if (sock.id === this.rooms[roomId].host) {
        this.newHost(roomId);
      }
    }
  }

  newHost(roomId: string): void {
    const room: Room = this.rooms[roomId];
    const randIdx: number = Math.floor(Math.random() * room.users.length);
    console.log("Chose user", room.users[randIdx].userName, "as new host.")
    room.host = room.users[randIdx].userId;
  }

  onSocketCreateParty(
    sock: io.Socket,
    ack: (data: { roomId: string }) => void
  ) {
    console.log('create room');
    const roomId = uuidv4();

    sock.join(roomId, () =>
      ack({
        roomId,
      })
    );

    this.createNewUser(sock, roomId);
  }

  createNewUser(sock: io.Socket, roomId: number): void {
    const newUser: User = {
      userId: sock.id,
      userName: "User" + this.rooms[roomId].users.length,
      image: "newImage",
    }

    this.rooms[roomId].users.push(newUser); 
  }
}
