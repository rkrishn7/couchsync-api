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
