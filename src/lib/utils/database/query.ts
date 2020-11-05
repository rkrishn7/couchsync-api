import camelCase from 'camelcase-keys';
import { Connection, QueryOptions } from 'mysql2/promise';

export const query = async (
  connection: Connection,
  opts: QueryOptions | string,
  params: Record<string, any>
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const results = await connection.query(opts, params);

  // transform results
  if (results[0]) {
    const formatted = camelCase(results[0], { deep: true });
    return formatted;
  }

  return undefined;
};
