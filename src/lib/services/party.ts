import { query } from 'lib/utils/database/query';
import { stringifyUrl } from 'query-string';
import { v4 as uuidv4 } from 'uuid';

import { Service } from './service';

interface CreateParams {
  watchUrl: string;
}

interface GetParams {
  partyHash: string;
}

export class Party extends Service {
  async create({ watchUrl }: CreateParams) {
    const hash = uuidv4();
    const joinUrl = stringifyUrl({
      url: watchUrl,
      query: {
        couchSyncRoomId: hash,
      },
    });

    await query(
      this.connection,
      `
        INSERT INTO parties (hash, join_url)
        VALUES (:hash, :joinUrl)
      `,
      {
        hash,
        joinUrl,
      }
    );

    const [{ parties: newParty }]: any = await query(
      this.connection,
      `
        SELECT * FROM parties WHERE hash = :hash
        LIMIT 1
      `,
      {
        hash,
      }
    );

    return newParty;
  }

  async getActiveParty({ partyHash }: GetParams) {
    const results: any = await query(
      this.connection,
      `
        SELECT * from parties party JOIN users ON users.party_id = party.id
        WHERE party.hash = :partyHash AND users.is_active
      `,
      {
        partyHash,
      }
    );

    const { party } = results[0];
    const users = results.map((r: any) => r.users);

    return {
      ...party,
      users,
    };
  }
}
