export interface Message {
  id: number;
  content: string;
  partyId: number;
  sentAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  partyHash?: string;
}
