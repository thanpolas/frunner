/**
 * @fileoverview trades-roam table related SQL queries.
 */

// eslint-disable-next-line import/no-unresolved
const { db } = require('../../../services/postgres.service');

const sql = (module.exports = {});

/** @type {string} Define the table to work on */
const TABLE = 'trades-roam';

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
      `${TABLE}.network`,

      `${TABLE}.opportunity_source_symbol`,
      `${TABLE}.opportunity_source_feed_price`,
      `${TABLE}.opportunity_source_oracle_price`,
      `${TABLE}.opportunity_source_usd_diff_percent`,
      `${TABLE}.opportunity_source_usd_diff_percent_hr`,

      `${TABLE}.opportunity_target_symbol`,
      `${TABLE}.opportunity_target_feed_price`,
      `${TABLE}.opportunity_target_oracle_price`,
      `${TABLE}.opportunity_target_usd_diff_percent`,
      `${TABLE}.opportunity_target_usd_diff_percent_hr`,

      `${TABLE}.opportunity_source_target_diff_percent`,
      `${TABLE}.opportunity_source_target_diff_percent_hr`,

      `${TABLE}.opportunity_block_number`,

      `${TABLE}.traded_tx`,
      `${TABLE}.traded_block_number`,

      `${TABLE}.traded_source_tokens`,
      `${TABLE}.traded_source_usd_value`,
      `${TABLE}.traded_target_tokens`,
      `${TABLE}.traded_actual_ratio_between_tokens`,
      `${TABLE}.traded_gas_spent`,
      `${TABLE}.traded_at`,

      // calculate ratio between source & target using oracle prices and
      // then based on that price, calculate the percentage difference between them.
      `${TABLE}.closed_source_usd_value`,
      `${TABLE}.closed_target_usd_value`,
      `${TABLE}.closed_source_target_diff_percent`,
      `${TABLE}.closed_source_target_diff_percent_hr`,

      // Translate the difference into USD
      `${TABLE}.closed_profit_loss_usd`,
      `${TABLE}.closed_source_oracle_price`,
      `${TABLE}.closed_target_oracle_price`,

      //  Indicates the trade has concluded collecting data (happens after the
      // target token oracle changes value).
      `${TABLE}.closed_trade`,
      `${TABLE}.closed_at`,

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
