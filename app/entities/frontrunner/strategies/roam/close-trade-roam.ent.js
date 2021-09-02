/**
 * @fileoverview Close the roam trade by waiting for an oracle update and
 *    storing it.
 */

const { db } = require('../../../../services/postgres.service');
const { SynthsToPairs } = require('../../../price-feeds');
const { getDivergence, divergenceHr } = require('../../../../utils/helpers');
const {
  update: tradeUpdate,
  getById: tradeGetById,
} = require('../../sql/trades-roam.sql');

const entity = (module.exports = {});

/**
 * Close the roam trade by waiting for an oracle update and storing it.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeOpportunity local state with active (open) roaming trade.
 * @return {Promise<Object|void>} A Promise with the closed trade or empty.
 */
entity.closeTradeRoam = async (divergencies, activeOpportunity) => {
  if (!activeOpportunity) {
    return;
  }

  return entity._checkCloseTradeRoam(divergencies, activeOpportunity);
};

/**
 * Checks if oracle has changed price.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeOpportunity local state with active (open) roaming trade.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._checkCloseTradeRoam = async (divergencies, activeOpportunity) => {
  const { state } = divergencies;

  // determine if a new block has been mined
  const currentBlock = state.blockNumber;

  if (currentBlock === activeOpportunity.opportunity_block_number) {
    return;
  }

  const pair = SynthsToPairs[activeOpportunity.opportunity_target_symbol];

  // Check if oracle price has moved
  const currentOraclePrice = state.oraclePrices[pair];

  if (
    currentOraclePrice === activeOpportunity.opportunity_target_oracle_price
  ) {
    return;
  }

  // Oracle price moved, close roaming trade
  return entity._closeTrade(divergencies, activeOpportunity);
};

/**
 * Close the open roaming trade.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeOpportunity local state with active (open) roaming trade.
 * @return {Promise<Object>} A Promise with the closed trade record.
 * @private
 */
entity._closeTrade = async (divergencies, activeOpportunity) => {
  const { state } = divergencies;
  const sourcePair = SynthsToPairs[activeOpportunity.opportunity_source_symbol];
  const targetPair = SynthsToPairs[activeOpportunity.opportunity_target_symbol];
  const closed_source_oracle_price = state.oraclePrices[sourcePair];
  const closed_target_oracle_price = state.oraclePrices[targetPair];
  const closed_source_usd_value =
    closed_source_oracle_price * activeOpportunity.traded_source_tokens;
  const closed_target_usd_value =
    closed_target_oracle_price * activeOpportunity.traded_target_tokens;
  const closed_source_target_diff_percent = getDivergence(
    closed_source_usd_value,
    closed_target_usd_value,
  );
  const closed_source_target_diff_percent_hr = divergenceHr(
    closed_source_target_diff_percent,
  );
  const closed_profit_loss_usd =
    closed_target_usd_value - closed_source_usd_value;

  const updateData = {
    closed_at: db().fn.now(),
    closed_source_oracle_price,
    closed_target_oracle_price,
    closed_source_usd_value,
    closed_target_usd_value,
    // calculate ratio between source & target using oracle prices and
    // then based on that price, calculate the percentage difference between them.
    closed_source_target_diff_percent,
    closed_source_target_diff_percent_hr,

    // Translate the difference into USD
    closed_profit_loss_usd,
    closed_block_number: divergencies.state.blockNumber,

    //  Indicates the trade has concluded collecting data (happens after the
    // target token oracle changes value).
    closed_trade: true,
  };

  await tradeUpdate(activeOpportunity.id, updateData);

  const closedTrade = await tradeGetById(activeOpportunity.id);

  return closedTrade;
};
