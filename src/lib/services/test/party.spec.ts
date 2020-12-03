import { TestInterface } from 'ava';
import { test as globalTest, CustomContext } from 'lib/test/fixtures/global';
import { ServiceError } from 'lib/errors/service-error';

interface PartyTestContext extends CustomContext {
  user?: any;
}

const test = globalTest as TestInterface<PartyTestContext>;

test.serial.beforeEach(async t => {
  const { user } = await t.context.services.users.create({
    socketId: 'blah',
  });

  t.context.user = user;
});

test('creates new party', async (t) => {
  const party = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  const { joinUrl, hostId } = party;

  t.deepEqual(hostId, null);
  t.regex(
    joinUrl,
    /https:\/\/www\.youtube\.com\/watch\?couchSyncRoomId=\S+&v=MepGo2xmVJw/
  );
});

test('get active party - success', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user!.socketId,
  });

  const getParty = await t.context.services.party.getActiveParty({ partyHash: hash });

  t.deepEqual(getParty.hostId, 1);
  t.deepEqual(getParty.hash, hash);
  t.deepEqual(getParty.joinUrl, `https://www.youtube.com/watch?couchSyncRoomId=${hash}&v=MepGo2xmVJw`);
});

test('get active party - party does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.party.getActiveParty({ partyHash: 'WrongPartyHash' });
  }, {
    instanceOf: ServiceError,
    message: 'Unable to find party'
  });
});

test('updates party details - success', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user!.socketId,
  });

  await t.context.services.party.updatePartyDetails({ partyHash: hash }, { watchUrl: 'https://www.youtube.com/watch?v=newUrl' });
  const getParty = await t.context.services.party.getActiveParty({ partyHash: hash });

  t.deepEqual(getParty.hash, hash);
  t.deepEqual(getParty.joinUrl, 'https://www.youtube.com/watch?v=newUrl');
});

test('updates party details - party does not exist', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  await t.context.services.users.joinParty({
    hash: hash,
    socketId: t.context.user!.socketId,
  });

  await t.context.services.party.updatePartyDetails({ partyHash: 'WrongHash' }, { watchUrl: 'https://www.youtube.com/watch?v=newUrl' });
  const getParty = await t.context.services.party.getActiveParty({ partyHash: hash });

  t.deepEqual(getParty.hash, hash);
  t.deepEqual(getParty.joinUrl, `https://www.youtube.com/watch?couchSyncRoomId=${hash}&v=MepGo2xmVJw`);
});
