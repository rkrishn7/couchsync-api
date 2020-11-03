import dbClient from '@app/database/client';
import { pick } from 'lodash';
import { stringifyUrl } from 'query-string';
import { v4 as uuidv4 } from 'uuid';

interface CreateParams {
  watchUrl: string;
}

interface GetParams {
  partyHash: string;
}

interface SearchUsersParams {
  partyHash: string;
}

export default class Party {
  static async create({ watchUrl }: CreateParams) {
    const hash = uuidv4();
    const joinUrl = stringifyUrl({
      url: watchUrl,
      query: {
        couchSyncRoomId: hash,
      },
    });

    const newParty = await dbClient.party.create({
      data: {
        hash,
        joinUrl,
      },
    });

    return pick(newParty, ['hash', 'joinUrl', 'id']);
  }

  static async getActiveParty({ partyHash }: GetParams) {
    return dbClient.party.findFirst({
      where: {
        hash: partyHash,
        hostId: {
          not: null,
        },
      },
    });
  }

  static async searchUsers({ partyHash }: SearchUsersParams) {
    return dbClient.party.findFirst({
      where: {
        hash: partyHash,
      },
      select: {
        users: true,
      },
    });
  }
}
