/**
 * @fileoverview Frontrunner core functionality.
 */

const config = require('config');
const { assignIn } = require('lodash');

const { events, eventTypes } = require('../../events');
const { PAIRS_AR } = require('../../price-feeds');

const { determineAction } = require('./decision-maker.ent');
const { getDivergence } = require('../../../utils/helpers');
const log = require('../../../services/log.service').get();

const { PRICE_FEED_PROCESSED, NEW_BLOCK } = eventTypes;

const entity = (module.exports = {});

/** @type {number} Store on which heartbeat an update log was made. */
entity._lastHeartbeatUpdate = 0;

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
 * @return {void}
 */
entity.init = () => {
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

  const divergencies = {
    state: assignIn(state), // deep copy state
    oracleToFeed: {},
  };

  // Note: Oracle prices and synth prices are 100% the same, so only the
  //    oracle to feed divergence is calculated.
  PAIRS_AR.forEach((pair) => {
    divergencies.oracleToFeed[pair] = getDivergence(
      state.oraclePrices[pair],
      state.feedPrices[pair],
    );
  });

  if (entity._shouldLogUpdate(divergencies)) {
    log.info(
      `Heartbeat Update ${state.heartbeat} - block number: ${state.blockNumber}`,
      {
        divergencies,
      },
    );
  }

  return determineAction(divergencies);
};

/**
 * Will determine if it's good time to dispatch a log update.
 *
 * @param {Object} divergencies The divergencies object.
 * @return {boolean} True if it's time to do an update.
 * @private
 */
entity._shouldLogUpdate = (divergencies) => {
  if (entity._lastHeartbeatUpdate === 0) {
    entity._lastHeartbeatUpdate = divergencies.state.heartbeat;
    return true;
  }

  if (divergencies.state.heartbeat % config.app.heartbeat_log_update === 0) {
    entity._lastHeartbeatUpdate = divergencies.state.heartbeat;
    return true;
  }
};
