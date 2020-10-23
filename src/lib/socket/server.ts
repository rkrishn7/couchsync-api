import { Server } from 'http';

import io from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface User {
  userId: string;
  userName: string;
  image: string;
  isHost: boolean;
}

interface Room {
  users: User[];
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

      const user: User = this.getUser(this.rooms[roomId], sock.id);
      if (user === null || user.isHost) {
        this.newHost(roomId);
      }
    }
  }

  private getUser(room: Room, userId: string): User {
    for (const user of room.users) {
      if (user.userId === userId) {
        return user;
      }
    }
    return null;
  }

  private newHost(roomId: string): void {
    const room: Room = this.rooms[roomId];
    this.clearHost(room);
    const randIdx: number = Math.floor(Math.random() * room.users.length);
    console.log("Chose user", room.users[randIdx].userName, "as new host.")
    room.users[randIdx].isHost = true;
  }

  private clearHost(room: Room): void {
    for (const user of room.users) {
      user.isHost = false;
    }
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

    this.createNewUser(sock, roomId, true);
  }

  createNewUser(sock: io.Socket, roomId: number, setHost = false): void {
    const newUser: User = {
      userId: sock.id,
      userName: "User" + this.rooms[roomId].users.length,
      image: "newImage",
      isHost: setHost,
    }

    this.rooms[roomId].users.push(newUser); 
  }
}
