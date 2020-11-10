import { Connection } from 'mysql2/promise';

export abstract class Service {
  /**
   * The connection to use for the service instance
   */
  connection!: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }
}
