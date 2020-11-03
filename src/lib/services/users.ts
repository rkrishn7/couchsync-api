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
    const user = await dbClient.user.create({
      data: {
        isActive: true,
        socketId,
        name: 'temp',
      },
    });

    return user;
  }

  static async deactivate({ socketId }: DeactivateParams) {
    const userAndPartialParty = await dbClient.user.update({
      where: {
        socket_id_is_active_unique: {
          socketId,
          isActive: true,
        },
      },
      data: {
        isActive: false,
        hostedParties: {
          set: [],
        },
      },
      include: {
        party: {
          select: {
            hash: true,
            host: true,
          },
        },
      },
    });

    // If we've removed the host, assign a new one
    if (!userAndPartialParty.party.host) {
      const userIds = await dbClient.user.findMany({
        where: {
          party: {
            hash: userAndPartialParty.party.hash,
          },
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (userIds.length) {
        // Pick a new host
        const { id: newHostUserId } = userIds[
          Math.floor(Math.random() * userIds.length)
        ];

        const { host: newHost } = await dbClient.party.update({
          where: {
            hash: userAndPartialParty.party.hash,
          },
          data: {
            host: {
              connect: {
                id: newHostUserId,
              },
            },
          },
          select: {
            host: true,
          },
        });

        return {
          newHost,
          user: userAndPartialParty,
        };
      }
    }

    return {
      user: userAndPartialParty,
    };
  }

  static async joinParty({ hash, socketId }: JoinPartyParams) {
    const party = await dbClient.party.findOne({
      where: {
        hash,
      },
    });

    if (!party) throw new Error('Fatal: No party found');

    const userName = await Users.generateRandomName({ partyHash: hash });
    const avatarUrl = Users.generateRandomAvatar({ userName });

    const userAndPartyWithActiveUsers = await dbClient.user.update({
      where: {
        socket_id_is_active_unique: {
          socketId,
          isActive: true,
        },
      },
      data: {
        party: {
          connect: {
            id: party.id,
          },
        },
        // If there's no host, set as host
        hostedParties: !party.hostId
          ? {
              connect: {
                hash: party.hash,
              },
            }
          : undefined,
        name: userName,
        avatarUrl,
      },
      include: {
        party: {
          include: {
            users: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    return {
      user: userAndPartyWithActiveUsers,
    };
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
