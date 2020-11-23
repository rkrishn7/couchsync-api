import { ExecutionContext} from 'ava';
import { test, CustomContext } from 'lib/test/fixtures/global';
import { ServiceError } from 'lib/errors/service-error';

interface createUserAndJoinPartyParams {
  t: ExecutionContext<CustomContext>, 
  hash: string, 
  socket: string, 
}

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

  const socketId = 'NewSocket';
  await createUserAndJoinParty({ t: t, hash: hash, socket: socketId});

  const getParty = await t.context.services.party.getActiveParty({ partyHash: hash });

  t.deepEqual(getParty.hostId, 1);
  t.deepEqual(getParty.hash, hash);
  t.deepEqual(getParty.joinUrl, `https://www.youtube.com/watch?couchSyncRoomId=${hash}&v=MepGo2xmVJw`);
});

test('get active party - party does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.party.getActiveParty({ partyHash: 'WrongPartyHash' });
  }, {instanceOf: ServiceError, message: 'Unable to find party'});
});

test('updates party details - success', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  const socketId = 'NewSocket';
  await createUserAndJoinParty({ t: t, hash: hash, socket: socketId});

  await t.context.services.party.updatePartyDetails({ partyHash: hash }, { watchUrl: 'https://www.youtube.com/watch?v=newUrl' });
  const getParty = await t.context.services.party.getActiveParty({ partyHash: hash });

  t.deepEqual(getParty.hash, hash);
  t.deepEqual(getParty.joinUrl, 'https://www.youtube.com/watch?v=newUrl');
});

test('updates party details - party does not exist', async (t) => {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  const socketId = 'NewSocket';
  await createUserAndJoinParty({ t: t, hash: hash, socket: socketId});

  await t.context.services.party.updatePartyDetails({ partyHash: 'WrongHash' }, { watchUrl: 'https://www.youtube.com/watch?v=newUrl' });
  const getParty = await t.context.services.party.getActiveParty({ partyHash: hash });

  t.deepEqual(getParty.hash, hash);
  t.deepEqual(getParty.joinUrl, `https://www.youtube.com/watch?couchSyncRoomId=${hash}&v=MepGo2xmVJw`);
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
