import request from 'supertest';
import { TestInterface } from 'ava';

import { test as globalTest, CustomContext } from 'lib/test/fixtures/global';

interface PartyTestContext extends CustomContext {
  user: any;
  party: any;
}

const test = globalTest as TestInterface<PartyTestContext>;

test.serial.beforeEach(async t => {
  const userSocketId = 'blah';

  await t.context.services.users.create({
    socketId: userSocketId,
  });

  const party = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  });

  const { user } = await t.context.services.users.joinParty({
    hash: party.hash,
    socketId: userSocketId,
  });

  t.context.user = user;
  t.context.party = party;
});

test('PUT /user/profile - 200', async (t) => {
  const { hash } = t.context.party;

  const res = await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 'NEWNAME',
      userId: t.context.user.id,
      avatarUrl: 'NEWURL',
      partyHash: hash,
    })
    .expect(200);

  const { user, success } = res.body;

  t.is(user.name, 'NEWNAME');
  t.is(user.avatarUrl, 'NEWURL');
  t.is(success, 'Profile Updated!');
});

test('PUT /user/profile - 422 invalid name', async (t) => {
  const { hash } = t.context.party;

  await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 1,
      userId: t.context.user.name,
      avatarUrl: 'NEWURL',
      partyHash: hash,
    })
    .expect(422);

  t.pass();
});

test('PUT /user/profile - 422 invalid userId', async (t) => {
  const { hash } = t.context.party.hash;

  await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 'NEWNAME',
      userId: 'INVALIDUSERID',
      avatarUrl: 'NEWURL',
      partyHash: hash,
    })
    .expect(422);

  t.pass();
});

test('PUT /user/profile - 422 invalid avatarUrl', async (t) => {
  const { hash } = t.context.party.hash;

  await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 'NEWNAME',
      userId: t.context.user.id,
      avatarUrl: 1,
      partyHash: hash,
    })
    .expect(422);

  t.pass();
});

test('PUT /user/profile - 422 invalid partyHash', async (t) => {
  await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 'NEWNAME',
      userId: t.context.user.id,
      avatarUrl: 'NEWURL',
      partyHash: 1,
    })
    .expect(422);

  t.pass();
});

test('PUT /user/profile - 500 user does not exist', async (t) => {
  await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 'NEWNAME',
      userId: 2,
      avatarUrl: 'NEWURL',
      partyHash: 'invalid',
    })
    .expect(500);

  t.pass();
});

test('PUT /user/profile - 500 party does not exist', async (t) => {
  await request(t.context.application)
    .put('/user/profile')
    .send({
      name: 'NEWNAME',
      userId: 3,
      avatarUrl: 'NEWURL',
      partyHash: 'WRONGHASH',
    })
    .expect(500);

  t.pass();
});
