/**
 * @fileoverview Decision maker - Close trades.
 */

const config = require('config');

const { db } = require('../../../../services/postgres.service');
const { PairsToSynths } = require('../../../price-feeds');
const { SynthsSymbols, snxTrade } = require('../../../synthetix');
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

const { sUSD } = SynthsSymbols;

const entity = (module.exports = {});

/**
 * Will check and close trades if necessary.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @return {Promise<Object|void>} A Promise with the closed trade or empty.
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

  const [closedTrade] = flatFilter(closedTradesRaw);

  return closedTrade;
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

  // Pair flipped to negative divergence, cut losses.
  return entity._closeTrade(divergencies, activeTrades, pair, true);
};

/**
 * Close the open trade.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {string} pair The open trading pair.
 * @param {boolean=} cutLosses Set to true if closing happens due to cut losses.
 * @return {Promise<Object|void>} A Promise with the closed trade record or
 *    empty if not closed yet.
 * @private
 */
entity._closeTrade = async (divergencies, activeTrades, pair, cutLosses) => {
  let tx;
  if (config.app.testing) {
    // On testing, emulate trade TX, as if it takes 2s.
    await wait(2000);
  } else {
    // Actually execute the trade.
    tx = await entity._performTrade(pair);
  }

  const closedTrade = await entity._updateTradeRecord(
    divergencies,
    activeTrades,
    pair,
    cutLosses,
    tx,
  );

  delete activeTrades[pair];

  return closedTrade;
};

/**
 * Will perform the actual trade, if all the conditions are met.
 *
 * @param {string} pair The pair to perform a trade for.
 * @return {Promise<Object|void>} A Promise with the tx object or empty.
 * @private
 */
entity._performTrade = async (pair) => {
  const synthSymbol = PairsToSynths[pair];

  const tx = await snxTrade(sUSD, synthSymbol);

  return tx;
};

/**
 * Update the trade record with the closed trade.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {string} pair The open trading pair.
 * @param {boolean=} cutLosses Set to true if closing happens due to cut losses.
 * @param {Object=} tx Transaction object of the trade or empty if testing.
 * @return {Promise<Object>} A Promise with the closed trade record.
 * @private
 */
entity._updateTradeRecord = async (
  divergencies,
  activeTrades,
  pair,
  cutLosses,
  tx,
) => {
  const trade = activeTrades[pair];

  const closed_oracle_price = divergencies.state.oraclePrices[pair];
  const closed_price_diff = closed_oracle_price - trade.traded_oracle_price;
  const closed_profit_loss_percent = getDivergence(
    trade.traded_oracle_price,
    closed_oracle_price,
  );
  let closed_profit_loss =
    closed_profit_loss_percent * trade.traded_source_tokens;
  const closed_feed_price = divergencies.state.feedPrices[pair];

  let closed_tx = '0x';
  let closed_block_number = divergencies.state.blockNumber;
  let closed_source_tokens = 1000;
  let closed_source_token_symbol = pair;
  let closed_dst_tokens = 10000;
  let closed_dst_token_symbol = 'sUSD';
  let closed_gas_spent = 0;

  if (tx) {
    closed_tx = tx.transactionHash;
    closed_source_tokens = tx.sourceTokenQuantityReadable;
    closed_source_token_symbol = tx.sourceTokenSymbol;
    closed_dst_tokens = tx.dstTokenQuantityReadable;
    closed_dst_token_symbol = tx.dstTokenSymbol;
    closed_block_number = tx.blockNumber;
    closed_gas_spent = tx.gasUsed.toString();

    closed_profit_loss =
      Number(closed_dst_tokens) - Number(trade.traded_source_tokens);
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
    closed_block_number,

    // New columns
    closed_cut_losses: !!cutLosses,
    closed_source_tokens,
    closed_source_token_symbol,
    closed_dst_tokens,
    closed_dst_token_symbol,
    closed_gas_spent,
  };

  await tradeUpdate(trade.id, tradeUpdateData);

  const closedTrade = await tradeGetById(trade.id);

  return closedTrade;
};
