/**
 * @fileoverview Decision maker.
 */

const config = require('config');

const { PAIRS_AR } = require('../../price-feeds');
const { ETH_ORACLES } = require('../../chainlink');
const {
  create: tradeCreate,
  update: tradeUpdate,
  getById: tradeGetById,
} = require('../sql/trades.sql');
const { asyncMapCap, wait } = require('../../../utils/helpers');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/** @type {Object} local copy of the last state pushed from events-plexer */
entity.lastDivergences = {};

/** @type {Object} local state with active (open) trades */
entity.activeTrades = {
  // BTCUSD: {
  //  id: [...]
  //  [...] Rest of "trades" model fields
  // }
};

/**
 * Will determine if an action needs to be taken based on the divergences
 * and the current stored trading state.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Promise<void>}
 * @private
 */
entity.determineAction = async (divergences) => {
  // const lastBlock = entity.lastDivergences?.state?.blockNumber;

  entity.lastDivergences = divergences;

  await Promise.all([
    entity._newOpportunities(divergences),
    // entity._checkCloseTrades(lastBlock, divergences),
  ]);

  const opportunities = entity._findOpportunities(divergences);

  // Filter out opportunities that open trades already exist for.
  const newOpportunities = opportunities.filter(
    (opportunity) => !entity.activeTrades[opportunity.pair],
  );

  await asyncMapCap(newOpportunities, entity._executeOpportunity);
};

/**
 * Will log the divergences in a human readable format.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Promise<void>}
 * @private
 */
entity._logHumanReadable = async (divergences) => {
  const { oracleToFeed } = divergences;

  const oracleToFeedHR = entity._convertToHumarReadable(oracleToFeed);
  await log.info('Received processed prices.', {
    custom: {
      oracleToFeedHR,
    },
  });
};

/**
 * Convert divergence values of a set of pair to human readable format.
 *
 * @param {Object<string>} singleSetDivergence A single set of divergence of pairs.
 * @return {Object<string>} Same set woth values converted to human readable form.
 * @private
 */
entity._convertToHumarReadable = (singleSetDivergence) => {
  const pairs = Object.keys(singleSetDivergence);

  const hr = {};
  pairs.forEach((pair) => {
    hr[pair] = `${(singleSetDivergence[pair] * 100).toFixed(2)}%`;
  });

  return hr;
};

/**
 * Discover and execute new trading opportunities.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Promise<Array<Object>>} A promise with the new trade records if any.
 * @private
 */
entity._newOpportunities = async (divergences) => {
  const opportunities = entity._findOpportunities(divergences);

  // Filter out opportunities that open trades already exist for.
  const newOpportunities = opportunities.filter(
    (opportunity) => !entity.activeTrades[opportunity.pair],
  );

  const tradeRecords = await asyncMapCap(
    newOpportunities,
    entity._executeOpportunity,
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
    const oracle = ETH_ORACLES[pair];

    if (divergence < oracle.deviation) {
      return;
    }

    // There is a trading opportunity, mark it
    const opportunity = {
      pair,
      divergence,
      blockNumber: divergences.state.blockNumber,
      oraclePrice: divergences.state.oraclePrices[pair],
      feedPrice: divergences.state.feedPrices[pair],
    };

    opportunities.push(opportunity);
  });

  return opportunities;
};

/**
 * Execute the opportunity.
 *
 * @param {Object} opportunity Local opportunity object.
 * @return {Promise<Object>} A Promise with the created trade record.
 * @private
 */
entity._executeOpportunity = async (opportunity) => {
  const { pair } = opportunity;

  // Lock pair on active trades to avoid race conditions
  entity.activeTrades[pair] = {};

  const tradeData = {
    pair,
    feed_price: opportunity.feedPrice,
    oracle_price: opportunity.oraclePrice,
    opportunity_blockNumber: opportunity.blockNumber,
    network: config.app.network,
    testing: config.app.testing,
  };

  const tradeId = await tradeCreate(tradeData);
  let tradeRecord = await tradeGetById(tradeId);
  entity.activeTrades[opportunity.pair] = tradeRecord;

  if (config.app.testing) {
    // On testing, emulate trade TX, as if it takes 2s.
    await wait(2000);
  } else {
    // Actually execute the trade.
  }

  const { state: currentState } = entity.lastDivergences;
  const traded_feed_price = currentState.feedPrices[pair];
  const traded_oracle_price = currentState.oraclePrices[pair];

  const tradeUpdateData = {
    traded: true,
    traded_feed_price,
    traded_oracle_price,
    traded_block_number: currentState.blockNumber,
    traded_tx: '0x',
    traded_tokens_total: 1000,
    traded_token_symbol: 'sUSD',
  };

  await tradeUpdate(tradeUpdateData);

  tradeRecord = await tradeGetById(tradeId);
  entity.activeTrades[opportunity.pair] = tradeRecord;

  return tradeRecord;
};

// entity._checkCloseTrades = async (lastBlock, divergences) => {

// };
