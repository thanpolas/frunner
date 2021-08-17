/**
 * @fileoverview Decision maker - Close trades.
 */

const config = require('config');

const { db } = require('../../../../services/postgres.service');
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
  divergenceHr,
} = require('../../../../utils/helpers');

const log = require('../../../../services/log.service').get();

// const { STAYING_COURSE, CUTTING_LOSSES } = LogEvents;
const { CUTTING_LOSSES } = LogEvents;

const entity = (module.exports = {});

/**
 * Will check and close trades if necessary.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @return {Promise<Array<Object>>} A Promise with the closed trade records.
 */
entity.closeTrades = async (divergencies, activeTrades) => {
  const tradePairs = Object.keys(activeTrades);

  if (tradePairs.length === 0) {
    return [];
  }

  const closedTradesRaw = await asyncMapCap(
    tradePairs,
    entity._checkCloseTrade.bind(null, divergencies, activeTrades),
  );

  const closedTrades = flatFilter(closedTradesRaw);

  return closedTrades;
};

/**
 * Checks if an open trade must be closed.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {string} pair The open trading pair.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._checkCloseTrade = async (divergencies, activeTrades, pair) => {
  const trade = activeTrades[pair];
  const { state } = divergencies;

  // determine if a new block has been mined
  const currentBlock = state.blockNumber;

  if (currentBlock === trade.opportunity_block_number) {
    return entity._checkStillOnTrack(divergencies, activeTrades, pair);
  }

  // Check if oracle price has moved
  const currentOraclePrice = state.oraclePrices[pair];

  if (currentOraclePrice === trade.traded_oracle_price) {
    return entity._checkStillOnTrack(divergencies, activeTrades, pair);
  }

  return entity._closeTrade(divergencies, activeTrades, pair);
};

/**
 * Oracle price has not moved yet, check if opportunity still is valid.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {string} pair The open trading pair.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._checkStillOnTrack = async (divergencies, activeTrades, pair) => {
  const divergence = divergencies.oracleToFeed[pair];

  // Strategy is to stay the course as long as divergence is positive
  if (divergence > 0) {
    // Don't await for speed.
    // log.info('Staying the course on open trade', {
    //   divergencies,
    //   pair,
    //   relay: STAYING_COURSE,
    // });
    return;
  }

  // Don't await for speed.
  log.info('_checkStillOnTrack() :: Negative divergence, cutting losses...', {
    divergencies,
    pair,
    relay: CUTTING_LOSSES,
  });

  // Pair flipped to negative divergence, cut losses.
  return entity._closeTrade(divergencies, activeTrades, pair);
};

/**
 * Close the open trade.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {string} pair The open trading pair.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._closeTrade = async (divergencies, activeTrades, pair) => {
  const trade = activeTrades[pair];
  const closed_oracle_price = divergencies.state.oraclePrices[pair];

  const closed_price_diff = closed_oracle_price - trade.traded_oracle_price;

  const closed_profit_loss_percent = getDivergence(
    trade.traded_oracle_price,
    closed_oracle_price,
  );

  const closed_profit_loss =
    closed_profit_loss_percent * trade.traded_source_tokens;

  const closed_feed_price = divergencies.state.feedPrices[pair];

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
    closed_price_diff,
    closed_profit_loss,
    closed_profit_loss_percent: divergenceHr(closed_profit_loss_percent),
    closed_feed_price,
    closed_oracle_price,
    closed_block_number: divergencies.state.blockNumber,
  };

  await tradeUpdate(trade.id, tradeUpdateData);
  const closedTrade = await tradeGetById(trade.id);
  delete activeTrades[pair];

  return closedTrade;
};
