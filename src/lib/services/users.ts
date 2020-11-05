import { transaction } from 'lib/utils/database/transaction';
import { generateRandomAvatar, generateRandomName } from 'lib/utils/users';

import { Service } from './service';

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

export class Users extends Service {
  async create({ socketId }: CreateParams) {
    const user = await transaction(this.connection, async (query) => {
      await query(
        {
          sql: `
          INSERT INTO users (socket_id, is_active)
          VALUES (:socketId, TRUE)
        `,
        },
        {
          socketId,
        }
      );

      const [user] = await query(
        {
          sql: `
          SELECT * FROM users WHERE socket_id = :socketId AND is_active = TRUE
          LIMIT 1
        `,
        },
        {
          socketId,
        }
      );

      return user;
    });

    return {
      user,
    };
  }

  async deactivate({ socketId }: DeactivateParams) {
    const { newHost, user } = await transaction(
      this.connection,
      async (query) => {
        await query(
          {
            sql: `
            UPDATE users u LEFT JOIN parties p ON u.id = p.host_id
            SET u.is_active = FALSE, p.host_id = NULL
            WHERE u.socket_id = :socketId AND u.is_active = TRUE
          `,
          },
          {
            socketId,
          }
        );

        const [user] = await query(
          {
            sql: `
            SELECT user.*, party.*, host.* FROM users user
            LEFT JOIN parties party ON user.party_id = party.id
            LEFT JOIN users host ON host.id = party.host_id
            WHERE user.socket_id = :socketId AND user.is_active = FALSE
          `,
            nestTables: true,
          },
          {
            socketId,
          }
        );

        /**
         * If the user was in a party and there is no host,
         * we need to re-assign a new host
         */
        if (user.party?.hash && !user.host?.id) {
          const userIds: any[] = await query(
            {
              sql: `
              SELECT users.id FROM users JOIN parties ON users.party_id = parties.id
              WHERE parties.hash = :partyHash AND users.is_active = TRUE
            `,
            },
            {
              partyHash: user.party.hash,
            }
          );

          if (userIds?.length) {
            const { id: newHostUserId } = userIds[
              Math.floor(Math.random() * userIds.length)
            ];

            await query(
              {
                sql: `
                UPDATE parties p SET host_id = :hostId WHERE p.hash = :partyHash
              `,
              },
              {
                hostId: newHostUserId,
                partyHash: user.party.hash,
              }
            );

            const [newHost] = await query(
              {
                sql: `
                SELECT host.* FROM parties p JOIN users host on p.host_id = host.id
                WHERE p.hash = :partyHash
              `,
              },
              {
                partyHash: user.party.hash,
              }
            );

            return {
              newHost,
              user,
            };
          }
        }

        return {
          user,
        };
      }
    );

    return {
      newHost,
      user: {
        ...user.user,
        party: {
          ...user.party,
          host: user.host,
        },
      },
    };
  }

  async joinParty({ hash, socketId }: JoinPartyParams) {
    const { user, party, partyUsers } = await transaction(
      this.connection,
      async (query) => {
        const [userParty] = await query(
          `
        SELECT * FROM parties WHERE hash = :partyHash
        `,
          {
            partyHash: hash,
          }
        );

        const userName = generateRandomName();
        const avatarUrl = generateRandomAvatar({ userName });

        if (!userParty) {
          throw new Error('Fatal: No party found');
        }

        await query(
          `
        UPDATE users JOIN parties ON parties.id = :partyId
          SET name = :userName, avatar_url = :avatarUrl, party_id = :partyId,
          parties.host_id = CASE WHEN parties.host_id IS NULL THEN users.id ELSE parties.host_id END
          WHERE users.socket_id = :socketId AND users.is_active = TRUE
        `,
          {
            partyId: userParty.id,
            userName,
            avatarUrl,
            socketId,
          }
        );

        const results = await query(
          {
            sql: `
          SELECT * FROM users user
          JOIN parties party ON party.id = user.party_id
          LEFT JOIN users partyUsers ON partyUsers.party_id = party.id AND partyUsers.is_active = TRUE
          WHERE user.socket_id = :socketId
        `,
            nestTables: true,
          },
          {
            socketId,
          }
        );

        const { user, party } = results[0];
        const partyUsers = results.map((u: any) => u.partyUsers);

        return {
          user,
          party,
          partyUsers,
        };
      }
    );

    return {
      user: {
        ...user,
        party: {
          ...party,
          users: partyUsers,
        },
      },
    };
  }
}
