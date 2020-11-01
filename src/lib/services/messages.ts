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
  }

  static async create({ partyId, content, sentAt, socketId }: CreateParams) {
    const user = await dbClient.user.findFirst({
      where: {
        socketId,
        isActive: true,
      },
    });

    if (!user) throw new Error('Fatal: Invalid User');

    const newMessage = await dbClient.message.create({
      data: {
        party: {
          connect: {
            id: partyId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        content,
        sentAt,
      },
    });

    return {
      ...newMessage,
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
