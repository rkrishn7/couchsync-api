import request from 'supertest';

import { test, CustomContext } from 'lib/test/fixtures/global';
import { ExecutionContext } from 'ava';

interface createPartyAndUserParams {
  t: ExecutionContext<CustomContext>;
}

test('PUT /user/profile - 200', async (t) => {
  const { hash } = await createPartyAndUser({ t });

  const res = await request(t.context.application)
    .put('/user/profile')
    .send({ 
      name: 'NEWNAME',
      userId: 1,
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
  const { hash } = await createPartyAndUser({ t });

  await request(t.context.application)
    .put('/user/profile')
    .send({ 
      name: 1,
      userId: 1,
      avatarUrl: 'NEWURL',
      partyHash: hash, 
    })
    .expect(422);

  t.pass();
});

test('PUT /user/profile - 422 invalid userId', async (t) => {
  const { hash } = await createPartyAndUser({ t });

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
  const { hash } = await createPartyAndUser({ t });

  await request(t.context.application)
    .put('/user/profile')
    .send({ 
      name: 'NEWNAME',
      userId: 1,
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
      userId: 1,
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
  await createPartyAndUser({ t });

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

async function createPartyAndUser({ t }: createPartyAndUserParams ) {
  const { hash } = await t.context.services.party.create({
    watchUrl: 'https://www.youtube.com/watch?v=MepGo2xmVJw',
  }); 
  
  const socket = 'newSocket';
  await t.context.services.users.create({
    socketId: socket,
  });

  const { user } = await t.context.services.users.joinParty({
    hash: hash,
    socketId: socket,
  });

  return { user, hash };
}