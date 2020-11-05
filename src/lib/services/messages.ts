import { transaction } from 'lib/utils/database/transaction';

import { Service } from './service';

interface CreateParams {
  socketId: string;
  partyId: number;
  content: string;
  sentAt: Date;
}

export class Messages extends Service {
  async create({ partyId, content, sentAt, socketId }: CreateParams) {
    const message = await transaction(this.connection, async (query) => {
      await query(
        `
          INSERT INTO messages (party_id, user_id, content, sent_at)
          SELECT :partyId, u.id, :content, :sentAt FROM users u WHERE socket_id = :socketId AND is_active = TRUE
        `,
        {
          partyId,
          content,
          sentAt: new Date(sentAt),
          socketId,
        }
      );

      const [{ message, user, party }] = await query(
        `
          SELECT * FROM messages message
          JOIN users user on message.user_id = user.id
          JOIN parties party on message.party_id = party.id
          WHERE user.socket_id = :socketId
          ORDER BY message.id DESC
          LIMIT 1
        `,
        {
          socketId,
        }
      );

      return {
        ...message,
        user,
        party,
      };
    });

    return message;
  }

  /*static async search({ partyId }: SearchParams) {
    const messages = await transaction(this.connection, async (query) => {});

    const messages = await dbClient.message.findMany({
      where: {
        partyId,
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // TODO: add extra layer of security
    // accept a socket id and make sure the user is in the
    // party before returning new messages

    return { messages };
  }*/
}
