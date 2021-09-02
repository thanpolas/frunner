/**
 * @fileoverview Setup cases for trades-roam table.
 */

const invariant = require('invariant');

const { db } = require('../../app/services/postgres.service');

const setup = (module.exports = {});

/**
 * Delete all trade records.
 *
 * @return {Promise<void>}
 */
setup.deleteAll = async () => {
  const dbName = db().context.client.connectionSettings.database;

  invariant(
    dbName === 'frontrunner-test',
    `Not in testing db, cannot truncate trade records. dbName: ${dbName}`,
  );

  await db()('trades-roam').truncate();
};
