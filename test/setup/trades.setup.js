/**
 * @fileoverview Setup cases for trades table.
 */

const invariant = require('invariant');

const faker = require('faker');
const lodash = require('lodash');

const testLib = require('../lib/test.lib');

const tradesSql = require('../../app/entities/frontrunner/sql/trades.sql');

const { db } = require('../../app/services/postgres.service');

const setup = (module.exports = {});

/**
 * Creates a trade record.
 *
 * @param {Object} options Options:
 * @return {Promise<Object>} An object with needed properties, see at bottom.
 */

setup.create = async (options = {}) => {};

/**
 * Delete all trade records.
 *
 * @return {Promise<void>}
 */
setup.deleteAll = async () => {
  const dbName = db().context.client.connectionSettings.database;

  invariant(
    dbName !== 'frontrunner-test',
    'Not in testing db, cannot truncate trade records',
  );

  await db('trades').truncate();
};
