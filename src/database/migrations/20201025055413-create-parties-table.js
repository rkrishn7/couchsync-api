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
  return db.runSql(`
    CREATE TABLE parties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hash VARCHAR(40) NOT NULL UNIQUE,
      join_url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      member_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE parties
  `);
};

exports._meta = {
  version: 1,
};
