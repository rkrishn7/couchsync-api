import dbClient from '@app/database/client';
import PartyService from '@app/lib/services/party';
import Avatars from '@dicebear/avatars';
import sprites from '@dicebear/avatars-identicon-sprites';
import { adjectives, animals, Config, uniqueNamesGenerator } from 'unique-names-generator';

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
        name: "temp",
        avatar_url: "temp",
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

    const username: string = await Users.generateName(hash);
    console.log(socketId);
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
        name: username,
        avatar_url: Users.generateImage(username),
      },
    });
    return party;
  }

  private static generateImage(userName: string): string {
    const options = {}; // I'm leaving this blank for now, but we'll want to add options so the image fits nicely in the chat window
    const avatars = new Avatars(sprites, options);
    return avatars.create(userName);
  }

  private static async generateName(partyHash: string): Promise<string> {
    const set: Set<string> = await PartyService.getCurrentUsernames({partyHash});
    const nameConfig: Config = {
      dictionaries: [adjectives, animals],
      separator: ' ',
      style: 'capital',
      length: 2,
    };
    let randName: string;
    do {
      randName = uniqueNamesGenerator(nameConfig);
    } while (set.has(randName));
    console.log("New name:", randName);
    return randName;
  }
}
