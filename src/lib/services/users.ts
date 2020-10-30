import dbClient from '@app/database/client';
import PartyService from '@app/lib/services/party';
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
    const image: string = Users.generateImage(username)
    await dbClient.users.update({
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
        avatar_url: image,
      },
    });
    return party;
  }

  private static generateImage(userName: string): string {
    /*
     * GET Options
     * r : radius of icon 
     * m : margin of icon
     * b : background color - 24 bit rgb
     * w : width of icon
     * h : height of icon
     * colorLevel : brightness of color
     * 
     * EX: ?r=4&m=2&b=%23b99d9d&w=1&h=1&colorLevel=800
     */
    const options = ""; // I'm leaving this blank for now, but we'll want to add options so the image fits nicely in the chat window
    const baseUrl = "https://avatars.dicebear.com/api/identicon/";
    return baseUrl + encodeURIComponent(userName) + ".svg" + options;
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
