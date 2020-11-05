import { Connection, QueryOptions } from 'mysql2/promise';

import { query } from './query';

type Work = (
  query: (
    opts: QueryOptions | string,
    params: Record<string, any>
  ) => Promise<any>
) => Promise<any>;

export const transaction = async (connection: Connection, work: Work) => {
  await connection.beginTransaction();

  try {
    const result = await work((opts, params) =>
      query(connection, opts, params)
    );
    await connection.commit();
    return result;
  } catch (e) {
    console.log(e);
    await connection.rollback();
    throw new Error('Error executing transaction. Rolling back...');
  }
};
