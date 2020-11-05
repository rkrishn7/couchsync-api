import { Connection, QueryOptions } from 'mysql2/promise';

import { query } from './query';

type Work = (
  query: (
    sql: string,
    params: Record<string, any>,
    opts?: Omit<QueryOptions, 'sql'>
  ) => Promise<any>
) => Promise<any>;

export const transaction = async (connection: Connection, work: Work) => {
  await connection.beginTransaction();

  try {
    const result = await work((sql, params, opts) =>
      query(connection, sql, params, opts)
    );
    await connection.commit();
    return result;
  } catch (e) {
    console.log(e);
    await connection.rollback();
    throw new Error('Error executing transaction. Rolling back...');
  }
};
