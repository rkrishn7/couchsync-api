import { Messages } from './messages';
import { Party } from './party';
import { Users } from './users';

export const getServices = () => ({
  users: Users,
  party: Party,
  messages: Messages,
});

export interface Services {
  users: Users;
  party: Party;
  messages: Messages;
}
