import dbClient from '@app/database/client';
import { stringifyUrl } from 'query-string';
import { v4 as uuidv4 } from 'uuid';

interface CreateParams {
  watchUrl: string;
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
}
