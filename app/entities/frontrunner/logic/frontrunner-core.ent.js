/**
 * @fileoverview Frontrunner core functionality.
 */

const { PRICE_FEED_PROCESSED, NEW_BLOCK } =
  require('../constants/event-types.const').eventTypes;
const { getEvents } = require('./heartbeat.ent');

const log = require('../../../services/log.service').get();

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
};

entity._determineAction = async () => {
  // await log.info('Received processed prices.', {
  //   custom: {
  //     prices,
  //     heartbeat,
  //   },
  // });
};
