import dbClient from '@app/database/client';

interface SearchParams {
  partyId: number;
}

interface CreateParams {
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
    });

    return { messages };
  }

  static async create({ partyId, content, sentAt }: CreateParams) {
    await dbClient.messages.create({
      data: {
        parties: {
          connect: {
            id: partyId,
          },
        },
        content,
        sent_at: sentAt,
      },
    });
  }
}
