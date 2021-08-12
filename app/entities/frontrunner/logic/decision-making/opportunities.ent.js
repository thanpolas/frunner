/**
 * @fileoverview Decision maker - Discover and ceize opportunities.
 */

const config = require('config');

const { PAIRS_AR } = require('../../../price-feeds');
// const { ETH_ORACLES } = require('../../../chainlink');
const {
  create: tradeCreate,
  update: tradeUpdate,
  getById: tradeGetById,
} = require('../../sql/trades.sql');

const { asyncMapCap, wait } = require('../../../../utils/helpers');

// const log = require('../../../../services/log.service').get();

const entity = (module.exports = {});

/**
 * Discover and execute new trading opportunities.
 *
 * @param {Object} divergences The calculated divergences.
 * @param {Object} activeTrades local state with active (open) trades.
 * @return {Promise<Array<Object>>} A promise with the new trade records if any.
 * @private
 */
entity.opportunities = async (divergences, activeTrades) => {
  const opportunities = await entity._findOpportunities(divergences);

  // Filter out opportunities that open trades already exist for.
  const newOpportunities = opportunities.filter(
    (opportunity) => !activeTrades[opportunity.pair],
  );

  const tradeRecords = await asyncMapCap(
    newOpportunities,
    entity._executeOpportunity.bind(null, divergences, activeTrades),
  );

  return tradeRecords;
};

/**
 * Will determine if there are trading opportunities based on the oracle
 * divergence threshold of each token.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Array<Object>} Opportunities objects.
 * @private
 */
entity._findOpportunities = async (divergences) => {
  const { oracleToFeed } = divergences;

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
      blockNumber: divergences.state.blockNumber,
      oraclePrice: divergences.state.oraclePrices[pair],
      feedPrice: divergences.state.feedPrices[pair],
      traded_projected_percent: divergence,
    };

    opportunities.push(opportunity);
  });

  return opportunities;
};

/**
 * Execute the opportunity.
 *
 * @param {Object} divergences The calculated divergences.
 * @param {Object} activeTrades local state with active (open) trades.
 * @param {Object} opportunity Local opportunity object.
 * @return {Promise<Object>} A Promise with the created trade record.
 * @private
 */
entity._executeOpportunity = async (divergences, activeTrades, opportunity) => {
  const { pair } = opportunity;

  // Lock pair on active trades to avoid race conditions
  activeTrades[pair] = {};

  const tradeData = {
    pair,
    opportunity_feed_price: opportunity.feedPrice,
    opportunity_oracle_price: opportunity.oraclePrice,
    opportunity_block_number: opportunity.blockNumber,
    network: config.app.network,
    testing: config.app.testing,
  };

  const tradeId = await tradeCreate(tradeData);
  let tradeRecord = await tradeGetById(tradeId);
  activeTrades[opportunity.pair] = tradeRecord;

  let traded_tx = '0x';
  if (config.app.testing) {
    // On testing, emulate trade TX, as if it takes 2s.
    await wait(2000);
  } else {
    traded_tx = await entity._performTrade();
    // Actually execute the trade.
  }

  const { state: currentState } = divergences;
  const traded_feed_price = currentState.feedPrices[pair];
  const traded_oracle_price = currentState.oraclePrices[pair];

  const tradeUpdateData = {
    traded: true,
    traded_feed_price,
    traded_oracle_price,
    traded_block_number: currentState.blockNumber,
    traded_projected_percent: divergences.oracleToFeed[pair],
    traded_tx,
    traded_tokens_total: 10000,
    traded_token_symbol: 'sUSD',
  };

  await tradeUpdate(tradeId, tradeUpdateData);

  tradeRecord = await tradeGetById(tradeId);
  activeTrades[opportunity.pair] = tradeRecord;

  return tradeRecord;
};
