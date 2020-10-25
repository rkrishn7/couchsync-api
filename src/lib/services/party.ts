import dbClient from '@app/database/client';
import { v4 as uuidv4 } from 'uuid';

export default class Party {
  static async create(watchUrl: string) {
    const partyHash = uuidv4();
    // TODO: use query-string to generate joinUrl?
    const joinUrl = `${watchUrl}&couchSyncRoomId=${partyHash}`;

    await dbClient.parties.create({
      data: {
        party_hash: partyHash,
        join_url: joinUrl,
      },
    });

    return partyHash;
  }
}
