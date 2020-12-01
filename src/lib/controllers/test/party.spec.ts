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

  t.pass();
});

test('GET /party/ - 200', async (t) => {

  // need to create a new user and party for test to work
  const res = await request(t.context.application)
    .post('/party/create')
    .send({ watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw' })
    .expect(200);

  const { hash } = res.body;

  const socket = 'newSocket'
  await t.context.services.users.create({
    socketId: socket,
  });

  await t.context.services.users.joinParty({
    socketId: socket,
    hash: hash,
  });

  await request(t.context.application)
    .get(`/party/?partyHash=${hash}`)
    .expect(200);

  t.pass();
});

test('GET /party/ - 422', async (t) => {
  await request(t.context.application)
    .get(`/party/`)
    .expect(422);

  t.pass();
});

test('GET /party/ - 500', async (t) => {
  await request(t.context.application)
    .get(`/party/?partyHash=BADURL`)
    .expect(500);

  t.pass();
});
