import { TestInterface } from 'ava';
import { test as globalTest, CustomContext } from 'lib/test/fixtures/global';

interface MessageTestContext extends CustomContext {
  user?: any;
}

const test = globalTest as TestInterface<MessageTestContext>;

test.serial.beforeEach(async t => {
  const { user } = await t.context.services.users.create({
    socketId: 'blah',
  });

  t.context.user = user;
});

test('creates new message - success', async (t) => {
  const { hash, id } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  const { user } = await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user!.socketId,
  });

  const messageContent = 'hello';
  const date = new Date();

  const message = await t.context.services.messages.create({
    partyId: id,
    content: messageContent,
    sentAt: date,
    socketId: user.socketId,
  });

  t.assert(message.id === 1, 'message id is not 1');
  t.assert(message.content === messageContent, 'messages are not the same');
  t.assert(message.partyId === 1, 'party id is not 1');
  t.assert(message.userId === 1, 'user id is not 1');
});

test('creates new message - party does not exist', async (t) => {
  const messageContent = 'hello';
  const date = new Date();

  await t.throwsAsync(async () => {
    await t.context.services.messages.create({
      partyId: 1, // party with id 1 does not exist
      content: messageContent,
      sentAt: date,
      socketId: t.context.user!.socket_id,
    });
  }, { instanceOf: Error });
});

test('creates new message - user does not exist', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user!.socketId,
  });

  const messageContent = 'hello';
  const date = new Date();

  await t.throwsAsync(async () => {
    await t.context.services.messages.create({
      partyId: 1,
      content: messageContent,
      sentAt: date,
      socketId: 'whoops',
    });
  }, { instanceOf: Error });
});
