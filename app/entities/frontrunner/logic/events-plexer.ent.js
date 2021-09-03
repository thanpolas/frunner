/**
 * @fileoverview Frontrunner core functionality.
 */

const config = require('config');
const { assignIn } = require('lodash');

const { events, eventTypes } = require('../../events');
const { PAIRS_AR } = require('../../price-feeds');
const { getCurrentTokenSymbol } = require('../../synthetix');

const { determineActionOpenClose } = require('../strategies/open-close');
const { determineActionRoam } = require('../strategies/roam');
const { getDivergence, perf } = require('../../../utils/helpers');
const log = require('../../../services/log.service').get();

const { PRICE_FEED_PROCESSED, NEW_BLOCK, BITFINEX_TRADE } = eventTypes;

const entity = (module.exports = {});

/** @type {number} Store on which heartbeat an update log was made. */
entity._lastHeartbeatUpdate = 0;

/** @type {boolean} Trading activity toggle */
entity._active = true;

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
  _tempEnableBlockMonitor: false,
  _tempLastBtcBlockNumber: 0,
  _tempLastBtcStamp: null,
};

/**
 * Initialize the heartbeat functionality.
 *
 * @return {void}
 */
entity.init = () => {
  events.on(PRICE_FEED_PROCESSED, entity._onPriceFeedProcessed);
  events.on(NEW_BLOCK, entity._onNewBlock);
  events.on(BITFINEX_TRADE, entity._onBitfinexTrade);
};

/**
 * Determines if service has started or is paused.
 *
 * @return {boolean} If the trading service is live.
 */
entity.isStarted = () => {
  return entity._active;
};

/**
 * Set whether trading should proceed or not.
 *
 * @param {boolean} status The status to set.
 */
entity.setActive = (status) => {
  entity._active = status;
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

  if (entity.localState._tempEnableBlockMonitor) {
    // Do not await on purpose
    entity._checkOracleLog(data);
  }

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
  if (!entity._active) {
    return;
  }
  const { localState: state } = entity;

  if (state.blockNumber === 0) {
    return;
  }

  // Check feed prices for all pairs have been collected before proceeding.
  const allFeedPairs = Object.keys(state.feedPrices);
  if (allFeedPairs.length !== 5) {
    return;
  }

  const divergencies = {
    state: assignIn(state), // deep copy state
    oracleToFeed: {},
    currentTokenSymbol: getCurrentTokenSymbol(),
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

  if (config.app.trade_strategy === 'roam') {
    return determineActionRoam(divergencies);
  }
  return determineActionOpenClose(divergencies);
};

/**
 * Will determine if it's good time to dispatch a log update.
 *
 * @param {Object} divergencies The divergencies object.
 * @return {boolean} True if it's time to do an update.
 * @private
 */
entity._shouldLogUpdate = () => {
  return false;
  // if (entity._lastHeartbeatUpdate === 0) {
  //   entity._lastHeartbeatUpdate = divergencies.state.heartbeat;
  //   return true;
  // }

  // if (divergencies.state.heartbeat % config.app.heartbeat_log_update === 0) {
  //   entity._lastHeartbeatUpdate = divergencies.state.heartbeat;
  //   return true;
  // }
};

/**
 * When enabled, checks and reports oracle price changes.
 *
 * @param {Object} data Data from the new block event.
 * @return {Promise<void>}
 * @private
 */
entity._checkOracleLog = async (data) => {
  const { oraclePrices, blockNumber } = data;
  const { BTCUSD: oldBTCUSD } = entity.localState.oraclePrices;
  const { BTCUSD: newBTCUSD } = oraclePrices.oracleByPair;

  if (oldBTCUSD === newBTCUSD) {
    return;
  }

  const firstTime = !entity.localState._tempLastBtcStamp;
  const blocksDiff = blockNumber - entity.localState._tempLastBtcBlockNumber;
  const timeDiff = perf(entity.localState._tempLastBtcStamp);

  if (!firstTime) {
    await log.info(
      `BTC Oracle Price change. Block: ${blockNumber} Block Diff: ${blocksDiff}, TimeDiff: ${timeDiff}` +
        ` Old Price: ${entity.localState.oraclePrices.BTCUSD}` +
        ` New Price: ${oraclePrices.oracleByPair.BTCUSD}`,
      { relay: true },
    );
  }

  entity.localState._tempLastBtcBlockNumber = blockNumber;
  entity.localState._tempLastBtcStamp = perf();
};

/**
 * Handles a price update event from bitfinex.
 *
 * @param {string} pair The pair that has updated.
 * @param {number} price The price of the pair.
 * @return {Promise<void>}
 * @private
 */
entity._onBitfinexTrade = async (pair, price) => {
  entity.localState.feedPrices[pair] = price;
  await entity._processAndDecide();
};
