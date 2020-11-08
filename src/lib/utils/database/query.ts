import camelCase from 'camelcase-keys';
import { Connection, QueryOptions } from 'mysql2/promise';

/**
 * Uses `connection.query` and returns the result set, if any, deeply formatted into camelCase
 * @param connection
 * @param opts
 * @param params
 */
export const query = async (
  connection: Connection,
  sql: string,
  params: Record<string, any>,
  opts: Omit<QueryOptions, 'sql'> = {}
) => {
  const finalOptions: QueryOptions = {
    sql,
    nestTables: true,
    ...opts,
  };

  const results = await connection.query(finalOptions, params);

  const formatted = camelCase(results[0], { deep: true });
  return formatted;
};
