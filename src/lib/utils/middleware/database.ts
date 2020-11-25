import { getServices } from 'lib/services';
import { mapValues } from 'lodash';
import { Pool } from 'mysql2/promise';

export const grantConnection = (pool: Pool) => {
  return async (req: any, res?: any, next?: () => void) => {
    const connection = await pool.getConnection();

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
};
