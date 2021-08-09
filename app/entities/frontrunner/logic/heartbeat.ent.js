/**
 * @fileoverview The heartbeat is responsible for triggering and listening
 *    to events and re-distributing them normalized.
 */

const config = require('config');

const { fetchPriceFeeds, processPriceFeeds } = require('./price-feeds.ent');
const { handleNewBlock } = require('./handle-new-block.ent');
const { getProvider, network } = require('../../ether');
const { events, eventTypes } = require('../../events');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/** @type {number} counts how many heartbeats have happened  */
entity._heartbeat = 0;

/** @type {events?} setInterval reference. */
entity._heartbeatInterval = null;

/**
 * Initialize the heartbeat functionality.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise<void>}
 */
entity.init = async (bootOpts) => {
  if (bootOpts.testing) {
    return;
  }

  entity._createFeedHeartbeat();
  entity._createNewBlockWatch();
};

/**
 * Dispose of all the open handlers.
 *
 */
entity.dispose = () => {
  clearInterval(entity._heartbeatInterval);

  const provider = getProvider(network.optimistic_kovan);
  provider.removeAllListeners();
};

/**
 * Handles each heartbeat by fetching prices from feeds and propagating them
 * through events.
 *
 * @return {Promise<void>}
 */
entity._onHeartbeat = async () => {
  try {
    entity._heartbeat += 1;
    const prices = await fetchPriceFeeds();
    if (!prices) {
      return;
    }

    const processedPrices = processPriceFeeds(prices);

    events.emit(eventTypes.PRICE_FEED, prices, entity._heartbeat);
    events.emit(
      eventTypes.PRICE_FEED_PROCESSED,
      processedPrices,
      entity._heartbeat,
    );
  } catch (ex) {
    await log.error('_onHeartbeat() :: Failed', {
      error: ex,
      relay: true,
    });
  }
};

/**
 * Creates the heartbeat (setInterval) to fetch prices from external feeds
 * and process them.
 *
 * @return {void}
 * @private
 */
entity._createFeedHeartbeat = () => {
  // Create heartbeat
  entity._heartbeatInterval = setInterval(
    entity._onHeartbeat,
    config.app.heartbeat,
  );

  events.on('error', async (error) => {
    await log.error('heartbeat EventEmitter Error', {
      error,
      relay: true,
    });
  });

  // Handle promise rejection errors of event listeners
  events[Symbol.for('nodejs.rejection')] = async (error) => {
    await log.error('heartbeat EventEmitter Promise Rejection', {
      error,
      relay: true,
    });
  };
};

/**
 * Creates the new block watch.
 *
 * @private
 */
entity._createNewBlockWatch = () => {
  const provider = getProvider(network.optimistic_kovan);

  provider.on('block', handleNewBlock.bind(null, events));
};
