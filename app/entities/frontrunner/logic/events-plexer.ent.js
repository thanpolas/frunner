/**
 * @fileoverview Frontrunner core functionality.
 */

const { PRICE_FEED_PROCESSED, NEW_BLOCK } =
  require('../constants/event-types.const').eventTypes;

const { PAIRS_AR } = require('../../price-feeds');

const { getEvents } = require('./heartbeat.ent');
const { determineAction } = require('./decision-maker.ent');
const { getDivergence } = require('../../../utils/helpers');

const entity = (module.exports = {});

/**
 * Stores necessary local state.
 *
 * @type {Object}
 */
entity.localState = {
  heartbeat: 0,
  blockNumber: 0,
  feedPrices: {},
  oraclePrices: {},
  synthPrices: {},
};

/**
 * Initialize the heartbeat functionality.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  const events = getEvents();
  events.on(PRICE_FEED_PROCESSED, entity._onPriceFeedProcessed);
  events.on(NEW_BLOCK, entity._onNewBlock);
};

/**
 * Handle price feed processed event, check for trading opportunity.
 *
 * @param {Object<string>} prices The processed prices.
 * @param {number} heartbeat Heartbeat number.
 * @private
 */
entity._onPriceFeedProcessed = async (prices, heartbeat) => {
  entity.localState.feedPrices = prices;
  entity.localState.heartbeat = heartbeat;

  await entity._processAndDecide();
};

/**
 * Handle new block creation, assign values and check for action.
 *
 * @param {Object} data All fetched prices and block number.
 * @private
 */
entity._onNewBlock = async (data) => {
  const { synthPrices, oraclePrices, blockNumber } = data;
  entity.localState.blockNumber = blockNumber;
  entity.localState.oraclePrices = oraclePrices.oracleByPair;
  entity.localState.synthPrices = synthPrices;

  await entity._processAndDecide();
};

/**
 * Will process the prices and call the decision functions.
 *
 * @return {Promise<void>} An empty promise.
 * @private
 */
entity._processAndDecide = async () => {
  const { localState: state } = entity;

  if (state.heartbeat === 0 || state.blockNumber === 0) {
    return;
  }

  const divergences = {
    state,
    oracleToFeed: {},
  };

  // Note: Oracle prices and synth prices are 100% the same, so only the
  //    oracle to feed divergence is calculated.
  PAIRS_AR.forEach((pair) => {
    divergences.oracleToFeed[pair] = getDivergence(
      state.oraclePrices[pair],
      state.feedPrices[pair],
    );
  });

  return determineAction(divergences);
};
