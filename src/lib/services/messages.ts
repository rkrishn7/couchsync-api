import dbClient from '@app/database/client';

interface SearchParams {
  partyId: number;
}

interface CreateParams {
  socketId: string;
  partyId: number;
  content: string;
  sentAt: Date;
}

export default class Messages {
  static async search({ partyId }: SearchParams) {
    const messages = await dbClient.messages.findMany({
      where: {
        party_id: partyId,
      },
      include: {
        users: {
          select: {
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    // TODO: add extra layer of security
    // accept a socket id and make sure the user is in the
    // party before returning new messages

    return { messages };
  }

  static async create({ partyId, content, sentAt, socketId }: CreateParams) {
    const user = await dbClient.users.findFirst({
      where: {
        socket_id: socketId,
        is_active: true,
      },
    });

    if (!user) throw new Error('Fatal: Invalid User');

    const newMessage = await dbClient.messages.create({
      data: {
        parties: {
          connect: {
            id: partyId,
          },
        },
        users: {
          connect: {
            id: user.id,
          },
        },
        content,
        sent_at: sentAt,
      },
    });

    return {
      ...newMessage,
      user: {
        name: user.name,
        avatar_url: user.avatar_url,
      },
    };
  }
}
