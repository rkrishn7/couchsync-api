import { test, createUserAndJoinParty } from 'lib/test/fixtures/global';

test('creates new message - success', async (t) => {
  const { hash, id } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });
    
  const firstSocket = 'firstSocket';
  const user = await createUserAndJoinParty({ t: t, hash: hash, socket: firstSocket });

  const messageContent = 'hello';
  const date: Date = new Date();

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
  const socket = 'newSocket';
  await t.context.services.users.create({
    socketId: socket,
  });

  const messageContent = 'hello';
  const date: Date = new Date();

  await t.throwsAsync(async () => {
    await t.context.services.messages.create({
      partyId: 1, // party with id 1 does not exist
      content: messageContent, 
      sentAt: date, 
      socketId: socket,
    });
  }, { instanceOf: Error });
});

test('creates new message - user does not exist', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });
    
  const firstSocket = 'firstSocket';
  await createUserAndJoinParty({ t: t, hash: hash, socket: firstSocket });

  const messageContent = 'hello';
  const date: Date = new Date();

  await t.throwsAsync(async () => {
    await t.context.services.messages.create({
      partyId: 1,
      content: messageContent, 
      sentAt: date, 
      socketId: 'DoesNotExist',
    });
  }, { instanceOf: Error });
});
