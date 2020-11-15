import avaTest, { TestInterface } from 'ava';

import { getServices } from 'lib/services';
import { createPool } from 'database/pool';
import { mapValues } from 'lodash';

interface CustomContext {
  services: any;
  pool: any;
  connection: any;
}

const test = avaTest as TestInterface<CustomContext>;

test.serial.before((t) => {
  t.context.pool = createPool();
});

test.beforeEach(async (t) => {
  t.context.connection = await t.context.pool.getConnection();

  t.context.connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(
      /:(\w+)/g,
      function (txt, key) {
        // eslint-disable-next-line no-prototype-builtins
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this)
    );
  };

  t.context.services = mapValues(
    getServices(),
    (ServiceClass) => new ServiceClass(t.context.connection)
  );
});

test.afterEach((t) => {
  t.context.connection.release();
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
