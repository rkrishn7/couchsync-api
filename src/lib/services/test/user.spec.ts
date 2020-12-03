import { TestInterface } from 'ava';
import { test as globalTest, CustomContext } from 'lib/test/fixtures/global';

interface UserTestContext extends CustomContext {
  user: any;
}

const test = globalTest as TestInterface<UserTestContext>;

test.serial.beforeEach(async t => {
  const { user } = await t.context.services.users.create({
    socketId: 'blah',
  });

  t.context.user = user;
});

test('creates new user', async (t) => {
  const user = await t.context.services.users.create({
    socketId: 'newSocket'
  });
  const { socketId, isActive } = user.user;

  t.deepEqual(socketId, 'newSocket');
  t.deepEqual(isActive, 1);
});

test('updates display details - success', async (t) => {
  const { user } = await t.context.services.users.updateDisplayDetails({
    name: 'newName',
    userId: 1,
    avatarUrl: 'https://avatars.dicebear.com/api/bottts/couchs.svg',
  });

  const { name, avatarUrl } = user;

  t.deepEqual(name, 'newName');
  t.deepEqual(avatarUrl, 'https://avatars.dicebear.com/api/bottts/couchs.svg');
});

test('updates display details - user does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.users.updateDisplayDetails({
      name: 'newName',
      userId: 2,
      avatarUrl: 'https://avatars.dicebear.com/api/bottts/couchs.svg',
    });
  }, { instanceOf: Error });
});

test('deactivates non-host user - success', async (t) => {
  const user = await t.context.services.users.deactivate({ socketId: t.context.user.socketId });
  t.deepEqual(user.user.isActive, 0);
});

test.skip('deactivates host user, host changes - success', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user.socketId,
  });

  const newSocketId = 'socketId2';

  await t.context.services.users.create({
    socketId: newSocketId,
  });

  await t.context.services.users.joinParty({
    hash: hash,
    socketId: newSocketId,
  });

  const { hostId } = await t.context.services.party.getActiveParty({ partyHash: hash });
  t.deepEqual(hostId, 1);

  const { user, newHost } = await t.context.services.users.deactivate({ socketId: newSocketId });
  t.deepEqual(user.isActive, 0);
  t.deepEqual(newHost?.id, 1);
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

  const { user: { socketId, isActive, avatarUrl, name } } = await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user.socketId,
  });

  t.assert(socketId === t.context.user.socketId, 'socketId does not match');
  t.assert(isActive === 1, 'user is not active');
  t.assert(name !== null, 'name is null');
  t.assert(avatarUrl !== null, 'avatarUrl is null');
});

test('joins party - party does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.users.joinParty({ hash: 'DoesNotExist' , socketId: 'DoesNotExist' });
  }, { instanceOf: Error });
});

test('joins party - user does not exist', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.throwsAsync(async () => {
    await t.context.services.users.joinParty({ hash , socketId: 'DoesNotExist' });
  }, { instanceOf: Error });
});
