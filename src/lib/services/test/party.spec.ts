import { test } from 'lib/test/fixtures/global';

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
  const newParty = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  const getParty = await t.context.services.party.getActiveParty({ partyHash: newParty.hash });

  const { joinUrl, hostId, hash } = getParty;

  t.deepEqual(hostId, null);
  t.deepEqual(hash, '2c643ec2-517d-4d23-a872-ee1500d6c7ad')
  t.deepEqual(joinUrl, 'https://www.youtube.com/watch?couchSyncRoomId=2c643ec2-517d-4d23-a872-ee1500d6c7ad&v=0O8vw87g-bc');
});

test('get active party - fail', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.services.party.getActiveParty({ partyHash: 'WrongPartyHash' });
  }, {instanceOf: ServiceError, message: 'Unable to find party'});
});
