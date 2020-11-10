import dbClient from '@app/database/client';
import { getServices } from '@app/lib/services';
import { mapValues } from 'lodash';

export const database = async (req: any, res?: any, next?: () => void) => {
  const connection = await dbClient.getConnection();

  /**
   * Allow users to denote escape parameters with object key names
   * @example UPDATE posts SET title = :title
   * @param query
   * @param values
   */
  connection.config.queryFormat = function (query, values) {
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

  req.conn = connection;

  req.services = mapValues(
    getServices(),
    (ServiceClass) => new ServiceClass(connection)
  );

  // Release the connection from the pool once we emit a response
  if (res && typeof res.on === 'function')
    res.on('finish', () => connection.release());

  if (typeof next !== 'undefined') next();
};
