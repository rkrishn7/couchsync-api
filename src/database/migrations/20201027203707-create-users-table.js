'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(
    `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      socket_id VARCHAR(100) NOT NULL,
      is_active BOOLEAN,
      party_id INT,
      name VARCHAR(50) NOT NULL,
      avatar_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id),
      UNIQUE KEY socket_id_is_active_unique(socket_id, is_active)
    )
  `,
    () =>
      db.runSql(`
        ALTER TABLE messages
          ADD COLUMN user_id INT NOT NULL,
          ADD FOREIGN KEY (user_id) REFERENCES users(id)
      `)
  );
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE users
  `);
};

exports._meta = {
  version: 1,
};
