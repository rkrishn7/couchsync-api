import dbClient from '@app/database/client';
import { stringifyUrl } from 'query-string';
import { v4 as uuidv4 } from 'uuid';

interface CreateParams {
  watchUrl: string;
}

interface GetParams {
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

    const record = await dbClient.parties.create({
      data: {
        hash,
        join_url: joinUrl,
      },
    });

    return {
      hash,
      join_url: joinUrl,
      id: record.id,
    };
  }

  static async get({ partyHash }: GetParams) {
    return dbClient.parties.findFirst({
      where: {
        hash: partyHash,
      },
    });
  }

  static async getPartyWithUsers({ partyHash }: GetParams) {
    const party = dbClient.parties.findFirst({
      where: {
        hash: partyHash,
      },
      include: {
        users: true,
      },
    });
    return party;
  }

  static async getCurrentUsernames({ partyHash }: GetParams): Promise<Set<string>> {
    const party = await Party.getPartyWithUsers({
      partyHash: partyHash,
    });
    const usernames: string[] = [];
    console.log(party);
    for (const user of party.users) {
      usernames.push(user.name);
    }
    return new Set(usernames);
  }

}
