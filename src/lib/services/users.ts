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
    const { partyId } = await dbClient.user.findFirst({
      where: {
        socketId,
        isActive: true,
      },
      select: {
        partyId: true,
      },
    });

    const userUpdate = dbClient.user.update({
      where: {
        socket_id_is_active_unique: {
          socketId,
          isActive: true,
        },
      },
      data: {
        isActive: false,
      },
    });

    /**
     * Use tagged template literals to avoid SQL injection
     * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access#sql-injection
     */
    const partyUpdate = dbClient.$executeRaw`UPDATE parties SET member_count = member_count - 1, is_active = member_count > 0 WHERE id = ${partyId};`;

    await dbClient.$transaction(
      [userUpdate, partyId && partyUpdate].filter(Boolean) as any
    );
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

    const userUpdate = dbClient.user.update({
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
        name: userName,
        avatarUrl,
      },
    });

    /**
     * Use tagged template literals to avoid SQL injection
     * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access#sql-injection
     */
    const partyUpdate = dbClient.$executeRaw`UPDATE parties SET is_active = true, member_count = member_count + 1 WHERE id = ${party.id};`;

    const [user] = await dbClient.$transaction([userUpdate, partyUpdate]);

    return {
      user,
      party,
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
