import dbClient from '@app/database/client';
import PartyService from '@app/lib/services/party';
import { find } from 'lodash';
import { stringifyUrl } from 'query-string';
import {
  adjectives,
  animals,
  Config,
  uniqueNamesGenerator,
} from 'unique-names-generator';

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

interface GenerateRandomNameParams {
  partyHash: string;
}

interface GenerateAvatarParams {
  userName: string;
}

export default class Users {
  static async create({ socketId }: CreateParams) {
    const user = await dbClient.users.create({
      data: {
        is_active: true,
        socket_id: socketId,
        name: 'temp',
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

    const userName = await Users.generateRandomName({ partyHash: hash });
    const avatarUrl = await Users.generateRandomAvatar({ userName });
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
        name: userName,
        avatar_url: avatarUrl,
      },
    });
    return party;
  }

  private static generateRandomAvatar({ userName }: GenerateAvatarParams) {
    /**
     * List of options:
     * @see https://avatars.dicebear.com/
     * Or check out the README of the sprite collection
     */
    const options = {};
    const spriteType = 'gridy';
    const apiUrl = `https://avatars.dicebear.com/api/${spriteType}/${encodeURIComponent(
      userName
    )}.svg`;

    return stringifyUrl({
      url: apiUrl,
      query: options,
    });
  }

  private static async generateRandomName({
    partyHash,
  }: GenerateRandomNameParams) {
    const { users } = await PartyService.searchUsers({ partyHash });

    const nameConfig: Config = {
      dictionaries: [adjectives, animals],
      separator: ' ',
      style: 'capital',
      length: 2,
    };

    let randName: string;
    do {
      randName = uniqueNamesGenerator(nameConfig);
    } while (find(users, (u) => u.name === randName));

    return randName;
  }
}
