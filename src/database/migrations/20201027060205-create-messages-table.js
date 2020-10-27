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
    CREATE TABLE messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      party_id INT NOT NULL,
      sent_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id)
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
