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

    const [newParty]: any = await query(
      this.connection,
      `
      SELECT * FROM parties WHERE hash = :hash
    `,
      {
        hash,
      }
    );

    return newParty;
  }

  async getActiveParty({ partyHash }: GetParams) {
    const [{ party, users }]: any = await query(
      this.connection,
      {
        sql: `
        SELECT * from parties party JOIN users ON users.party_id = party.id
        WHERE party.hash = :partyHash
      `,
        nestTables: true,
      },
      {
        partyHash,
      }
    );

    console.log({
      party: {
        ...party,
        users,
      },
    });

    return {
      ...party,
      users: Array.isArray(users) ? users : [users],
    };
  }
}
