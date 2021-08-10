/**
 * @fileoverview Decision maker - Close trades.
 */

const config = require('config');

const { db } = require('../../../../services/postgres.service');
const decisionState = require('./decision-state.ent');
const { LogEvents } = require('../../../events');
const {
  update: tradeUpdate,
  getById: tradeGetById,
} = require('../../sql/trades.sql');

const {
  flatFilter,
  asyncMapCap,
  wait,
  getDivergence,
} = require('../../../../utils/helpers');

const log = require('../../../../services/log.service').get();

const { activeTrades } = decisionState;
const { STAYING_COURSE, CUTTING_LOSSES } = LogEvents;

const entity = (module.exports = {});

/**
 * Will check and close trades if necessary.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Promise<Array<Object>>} A Promise with the closed trade records.
 */
entity.closeTrades = async (divergences) => {
  const tradePairs = Object.keys(activeTrades);

  if (tradePairs.length === 0) {
    return [];
  }

  const closedTradesRaw = asyncMapCap(
    tradePairs,
    entity._checkCloseTrade.bind(null, divergences),
  );

  const closedTrades = flatFilter(closedTradesRaw);

  return closedTrades;
};

/**
 * Checks if an open trade must be closed.
 *
 * @param {Object} divergences The calculated divergences.
 * @param {string} pair The open trading pair.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._checkCloseTrade = async (divergences, pair) => {
  const trade = activeTrades[pair];
  const { state } = divergences;

  // determine if a new block has been mined
  const currentBlock = state.blockNumber;
  if (currentBlock === trade.opportunity_blockNumber) {
    return entity._checkStillOnTrack(divergences, pair);
  }

  // Check if oracle price has moved
  const currentOraclePrice = state.oraclePrices[pair];
  if (currentOraclePrice === trade.oracle_price) {
    return entity._checkStillOnTrack(divergences, pair);
  }

  return entity._closeTrade(divergences, pair);
};

/**
 * Oracle price has not moved yet, check if opportunity still is valid.
 *
 * @param {Object} divergences The calculated divergences.
 * @param {string} pair The open trading pair.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._checkStillOnTrack = async (divergences, pair) => {
  const divergence = divergences.oracleToFeed[pair];

  // Strategy is to stay the course as long as divergence is positive
  if (divergence > 0) {
    // Don't await for speed.
    log.info('Staying the course on open trade', {
      divergences,
      pair,
      relay: STAYING_COURSE,
    });
    return;
  }

  // Don't await for speed.
  log.info('_checkStillOnTrack() :: Negative divergence, cutting losses...', {
    divergences,
    pair,
    relay: CUTTING_LOSSES,
  });

  // Pair flipped to negative divergence, cut losses.
  return entity._closeTrade(divergences, pair);
};

/**
 * Close the open trade.
 *
 * @param {Object} divergences The calculated divergences.
 * @param {string} pair The open trading pair.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._closeTrade = async (divergences, pair) => {
  const trade = activeTrades[pair];
  const closed_oracle_price = divergences.state.oraclePrices[pair];

  const closed_profit_loss_number = closed_oracle_price - trade.oracle_price;
  const closed_profit_loss_percent = getDivergence(
    trade.oracle_price,
    closed_oracle_price,
  );
  const closed_feed_price = divergences.state.feedPrices[pair];

  let closed_tx = '0x';
  if (config.app.testing) {
    // On testing, emulate trade TX, as if it takes 2s.
    await wait(2000);
  } else {
    closed_tx = await entity._performTrade();
    // Actually execute the trade.
  }

  const tradeUpdateData = {
    closed_trade: true,
    closed_at: db().fn.now(),
    closed_tx,
    closed_profit_loss_number,
    closed_profit_loss_percent,
    closed_feed_price,
    closed_oracle_price,
    closed_block_number: divergences.state.blockNumber,
  };

  await tradeUpdate(trade.id, tradeUpdateData);
  const closedTrade = tradeGetById(trade.id);
  delete activeTrades[pair];

  return closedTrade;
};
