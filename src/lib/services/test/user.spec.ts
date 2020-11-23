import { ExecutionContext} from 'ava';
import { test, CustomContext } from 'lib/test/fixtures/global';

interface createUserAndJoinPartyParams {
  t: ExecutionContext<CustomContext>, 
  hash: string, 
  socket: string, 
}

test('creates new user', async (t) => {
  const user = await t.context.services.users.create({
    socketId: 'newSocket'
  });
  const { socketId, isActive } = user.user;

  t.deepEqual(socketId, 'newSocket');
  t.deepEqual(isActive, 1);
});

test('updates display details - success', async (t) => {
  await t.context.services.users.create({
    socketId: 'newSocket'
  });

  const user = await t.context.services.users.updateDisplayDetails({
    name: 'newName',
    userId: 1,
    avatarUrl: 'https://avatars.dicebear.com/api/bottts/couchs.svg',
  });
  const { name, avatarUrl } = user.user;

  t.deepEqual(name, 'newName');
  t.deepEqual(avatarUrl, 'https://avatars.dicebear.com/api/bottts/couchs.svg');
});

test('updates display details - user does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.users.updateDisplayDetails({
      name: 'newName',
      userId: 1,
      avatarUrl: 'https://avatars.dicebear.com/api/bottts/couchs.svg',
    });
  }, { instanceOf: Error });
});

test('deactivates non-host user - success', async (t) => {
  const socket = 'newSocket';
  await t.context.services.users.create({
    socketId: socket,
  });

  const user = await t.context.services.users.deactivate({ socketId: socket });
  t.deepEqual(user.user.isActive, 0);
});

test('deactivates host user, host changes - success', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });
    
  const firstSocket = 'firstSocket';
  await createUserAndJoinParty({ t: t, hash: hash, socket: firstSocket });

  const secSocket = 'secSocket';
  await createUserAndJoinParty({ t: t, hash: hash, socket: secSocket });

  let getParty = await t.context.services.party.getActiveParty({ partyHash: hash });
  t.deepEqual(getParty.hostId, 1);

  const user = await t.context.services.users.deactivate({ socketId: firstSocket });
  t.deepEqual(user.user.isActive, 0);

  getParty = await t.context.services.party.getActiveParty({ partyHash: hash });
  t.deepEqual(getParty.hostId, 2);
});

test('deactivates user - user does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.users.deactivate({ socketId: 'DoesNotExist' });
  }, { instanceOf: Error });
});

test('joins party - success', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });  

  const socket = 'socket';
  const { socketId, isActive, name, avatarUrl } = await createUserAndJoinParty({ t: t, hash: hash, socket: socket });
  
  t.assert(socketId === socket, 'socketId does not match');
  t.assert(isActive === 1, 'user is not active');
  t.assert(name !== null, 'name is null');
  t.assert(avatarUrl !== null, 'avatarUrl is null');
});

test('joins party - party does not exist', async (t) => {  
  await t.throwsAsync(async () => {
    await createUserAndJoinParty({ t: t, hash: 'DoesNotExist', socket: 'socket' });
  }, { instanceOf: Error }); 
});

test('joins party - user does not exist', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.throwsAsync(async () => {
    await t.context.services.users.joinParty({ hash , socket: 'DoesNotExist' });
  }, { instanceOf: Error }); 
});

async function createUserAndJoinParty({ t, hash, socket }: createUserAndJoinPartyParams) {
  await t.context.services.users.create({
    socketId: socket,
  });

  const { user } = await t.context.services.users.joinParty({
    hash: hash,
    socketId: socket,
  });
  return user;
}
