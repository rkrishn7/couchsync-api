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
    ALTER TABLE parties
      DROP COLUMN is_active,
      DROP COLUMN member_count,
      ADD COLUMN host_id INT,
      ADD FOREIGN KEY (host_id) REFERENCES users(id)
  `
  );
};

exports.down = function (db) {
  return db.runSql(
    `
    ALTER TABLE parties
      ADD COLUMN is_active BOOLEAN DEFAULT FALSE,
      ADD COLUMN member_count INT DEFAULT 0,
      DROP COLUMN host_id INT,
  `
  );
};

exports._meta = {
  version: 1,
};
