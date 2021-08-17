/**
 * @fileoverview Decision maker - Discover and ceize opportunities.
 */

const config = require('config');

const { PAIRS_AR, PairsToSynths } = require('../../../price-feeds');

const {
  create: tradeCreate,
  update: tradeUpdate,
  getById: tradeGetById,
} = require('../../sql/trades.sql');
const { SynthsSymbols, snxTrade } = require('../../../synthetix');

const { asyncMapCap, wait } = require('../../../../utils/helpers');

const { sUSD } = SynthsSymbols;

// const log = require('../../../../services/log.service').get();

const entity = (module.exports = {});

/**
 * Discover and execute new trading opportunities.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @return {Promise<Array<Object>>} A promise with the new trade records if any.
 * @private
 */
entity.opportunities = async (divergencies, activeTrades) => {
  const opportunities = await entity._findOpportunities(divergencies);

  // Filter out opportunities that open trades already exist for.
  const newOpportunities = opportunities.filter(
    (opportunity) => !activeTrades[opportunity.pair],
  );

  const tradeRecords = await asyncMapCap(
    newOpportunities,
    entity._executeOpportunity.bind(null, divergencies, activeTrades),
  );

  return tradeRecords.filter((t) => !!t);
};

/**
 * Will determine if there are trading opportunities based on the oracle
 * divergence threshold of each token.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @return {Array<Object>} Opportunities objects.
 * @private
 */
entity._findOpportunities = async (divergencies) => {
  const { oracleToFeed } = divergencies;

  const opportunities = [];
  PAIRS_AR.forEach((pair) => {
    const divergence = oracleToFeed[pair];
    // const oracle = ETH_ORACLES[pair];

    const divergenceThreshold = config.app.divergence_threshold;
    if (divergence < divergenceThreshold) {
      return;
    }

    // There is a trading opportunity, mark it
    const opportunity = {
      pair,
      divergence,
      blockNumber: divergencies.state.blockNumber,
      oraclePrice: divergencies.state.oraclePrices[pair],
      feedPrice: divergencies.state.feedPrices[pair],
      traded_projected_percent: divergence,
    };

    opportunities.push(opportunity);
  });

  return opportunities;
};

/**
 * Execute the opportunity.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {Object} opportunity Local opportunity object.
 * @return {Promise<Object>} A Promise with the created trade record.
 * @private
 */
entity._executeOpportunity = async (
  divergencies,
  activeTrades,
  opportunity,
) => {
  const { pair } = opportunity;

  // Check if there are activetrades, don't open a new trade if so.
  const hasActiveTrades = Object.keys(activeTrades);
  if (hasActiveTrades.length) {
    return;
  }

  // Lock pair on active trades to avoid race conditions
  activeTrades[pair] = {};

  const tradeRecord = await entity._createTradeRecord(opportunity);

  activeTrades[pair] = tradeRecord;

  let tx;
  if (config.app.testing) {
    // On testing, emulate trade TX, as if it takes 2s.
    await wait(2000);
  } else {
    // Actually execute the trade.
    tx = await entity._performTrade(pair);
  }

  const updatedTradeRecord = await entity._updateTradeRecord(
    divergencies,
    pair,
    tradeRecord,
    tx,
  );

  activeTrades[opportunity.pair] = updatedTradeRecord;

  return updatedTradeRecord;
};

/**
 * Create the initial trade record.
 *
 * @param {Object} opportunity Local opportunity object.
 * @return {Promise<Object>} A Promise with the created record.
 * @private
 */
entity._createTradeRecord = async (opportunity) => {
  const { pair } = opportunity;
  const tradeData = {
    pair,
    opportunity_feed_price: opportunity.feedPrice,
    opportunity_oracle_price: opportunity.oraclePrice,
    opportunity_block_number: opportunity.blockNumber,
    network: config.app.network,
    testing: config.app.testing,
  };

  const tradeId = await tradeCreate(tradeData);
  const tradeRecord = await tradeGetById(tradeId);

  return tradeRecord;
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
 * Updates the trade record with the executed trade.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {string} pair The pair of the opportunity.
 * @param {Object} tradeRecord The created trade record.
 * @param {Object=} tx Transaction object of the trade or empty if testing.
 * @return {Promise<Object>} A Promise with the updated trade record.
 * @private
 */
entity._updateTradeRecord = async (divergencies, pair, tradeRecord, tx) => {
  const { id: tradeId } = tradeRecord;
  const { state: currentState } = divergencies;
  const traded_feed_price = currentState.feedPrices[pair];
  const traded_oracle_price = currentState.oraclePrices[pair];
  let traded_tx = '0x';
  let traded_source_tokens = 10000;
  let traded_source_token_symbol = 'sUSD';
  let traded_block_number = currentState.blockNumber;
  let traded_dst_tokens = 1000;
  let traded_dst_token_symbol = pair;
  let traded_gas_spent = 0;

  if (tx) {
    traded_tx = tx.transactionHash;
    traded_source_tokens = tx.sourceTokenQuantityReadable;
    traded_source_token_symbol = tx.sourceTokenSymbol;
    traded_block_number = tx.blockNumber;
    traded_dst_tokens = tx.dstTokenQuantityReadable;
    traded_dst_token_symbol = tx.dstTokenSymbol;
    traded_gas_spent = tx.gasUsed.toString();
  }

  const tradeUpdateData = {
    traded: true,
    traded_projected_percent: divergencies.oracleToFeed[pair],
    traded_feed_price,
    traded_oracle_price,
    traded_block_number,
    traded_tx,
    traded_source_tokens,
    traded_source_token_symbol,
    traded_dst_tokens,
    traded_dst_token_symbol,
    traded_gas_spent,
  };

  await tradeUpdate(tradeId, tradeUpdateData);

  const updatedTradeRecord = await tradeGetById(tradeId);

  return updatedTradeRecord;
};
