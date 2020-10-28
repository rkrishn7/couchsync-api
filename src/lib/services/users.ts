import dbClient from '@app/database/client';

interface CreateParams {
  socketId: string;
}

interface DeactivateParams {
  socketId: string;
}

interface JoinPartyParams {
  socketId: string;
  hash: string;
}

export default class Users {
  static async create({ socketId }: CreateParams) {
    const user = await dbClient.users.create({
      data: {
        is_active: true,
        name: 'TODO: Generate random name',
        avatar_url: 'TODO: Generate avatar url',
        socket_id: socketId,
      },
    });

    return user;
  }

  static async deactivate({ socketId }: DeactivateParams) {
    await dbClient.users.update({
      where: {
        socket_id_is_active_unique: {
          socket_id: socketId,
          is_active: true,
        },
      },
      data: {
        is_active: false,
      },
    });
  }

  static async joinParty({ hash, socketId }: JoinPartyParams) {
    const party = await dbClient.parties.findOne({
      where: {
        hash,
      },
    });

    if (!party) throw new Error('Fatal: No party found');

    dbClient.users.update({
      where: {
        socket_id_is_active_unique: {
          socket_id: socketId,
          is_active: true,
        },
      },
      data: {
        parties: {
          connect: {
            id: party.id,
          },
        },
      },
    });

    return party;
  }
}
