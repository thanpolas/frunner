/**
 * @fileoverview trades table related SQL queries.
 */

// eslint-disable-next-line import/no-unresolved
const { db } = require('../../../services/postgres.service');

const sql = (module.exports = {});

/** @type {string} Define the table to work on */
const TABLE = 'trades';

/**
 * Return the SELECT statement to be performed for all queries.
 *
 * This is the API representation of this model.
 *
 * @return {Object} knex statement.
 */
sql.getSelect = () => {
  const statement = db()
    .select(
      `${TABLE}.id`,
      `${TABLE}.pair`,
      `${TABLE}.opportunity_feed_price`,
      `${TABLE}.opportunity_oracle_price`,
      `${TABLE}.opportunity_block_number`,
      `${TABLE}.network`,
      `${TABLE}.traded`,
      `${TABLE}.traded_feed_price`,
      `${TABLE}.traded_oracle_price`,
      `${TABLE}.traded_projected_percent`,
      `${TABLE}.traded_block_number`,
      `${TABLE}.traded_tx`,
      `${TABLE}.traded_tokens_total`,
      `${TABLE}.traded_token_symbol`,
      `${TABLE}.closed_trade`,
      `${TABLE}.closed_at`,
      `${TABLE}.closed_tx`,
      `${TABLE}.closed_profit_loss_number`,
      `${TABLE}.closed_profit_loss_percent`,
      `${TABLE}.closed_feed_price`,
      `${TABLE}.closed_oracle_price`,
      `${TABLE}.closed_block_number`,
      `${TABLE}.testing`,
      `${TABLE}.created_at`,
      `${TABLE}.updated_at`,
    )
    .from(TABLE);

  return statement;
};

/**
 * Create a record.
 *
 * @param {Object} input Sanitized input.
 * @param {Knex=} tx Transaction.
 * @return {Promise<UUID>} The id of the created record.
 */
sql.create = async (input, tx) => {
  const statement = db().insert(input).into(TABLE).returning('id');

  if (tx) {
    statement.transacting(tx);
  }

  const [result] = await statement;
  return result;
};

/**
 * Update a record.
 *
 * @param {UUID} id The record ID.
 * @param {Object} input The data to be updated.
 * @param {Knex=} tx Transaction.
 * @return {Promise<UUID>} The record id.
 */
sql.update = async (id, input = {}, tx) => {
  input.updated_at = db().fn.now();

  const statement = db()
    .table(TABLE)
    .where('id', id)
    .update(input)
    .returning('id');

  if (tx) {
    statement.transacting(tx);
  }

  const [result] = await statement;
  return result;
};

/**
 * Fetch a record by ID (single).
 *
 * @param {UUID} id Record id to filter with.
 * @param {Knex=} tx Transaction.
 * @return {Promise<Object>}
 */
sql.getById = async (id, tx) => {
  const statement = sql.getSelect();

  statement.where(`${TABLE}.id`, id);

  if (tx) {
    statement.transacting(tx);
  }

  const [result] = await statement;
  return result || null;
};

/**
 * Query for all open orders.
 *
 * @param {Knex=} tx Transaction.
 * @return {Promise<Array<Object>>}
 */
sql.getOpenTrades = async (tx) => {
  const statement = sql.getSelect();
  statement.where(`${TABLE}.closed_trade`, false);

  if (tx) {
    statement.transacting(tx);
  }

  const result = await statement;
  return result;
};

/**
 * Delete a record by id physically.
 *
 * @param {UUID} id Record id to delete.
 * @param {Knex=} tx Transaction.
 * @return {Promise<Object>}
 */
sql.deletePhysical = async (id, tx) => {
  const statement = db().table(TABLE).where('id', id).del();

  if (tx) {
    statement.transacting(tx);
  }

  const result = await statement;

  return result;
};
