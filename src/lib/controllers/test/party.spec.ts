import request from 'supertest';

import { test } from 'lib/test/fixtures/global';

test('POST /party/create - 200', async (t) => {
  const res = await request(t.context.application)
    .post('/party/create')
    .send({ watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw' })
    .expect(200);

  const { id, joinUrl, hostId } = res.body;

  t.is(id, 1);
  t.regex(joinUrl, /https:\/\/www\.youtube\.com\/watch\?couchSyncRoomId=\S+&v=MepGo2xmVJw/)
  t.is(hostId, null);
});

test('POST /party/create - 422', async (t) => {
  await request(t.context.application)
    .post('/party/create')
    .send({ watchUrl: 'youtube.com' })
    .expect(422);

  t.assert(true);
});
