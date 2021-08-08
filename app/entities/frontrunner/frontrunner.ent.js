/**
 * @fileoverview Frontrunner entity - core functionality.
 */

const {
  init: initHeartbeat,
  dispose: disposeHeartbeat,
} = require('./logic/heartbeat.ent');

const {
  fetchPriceFeeds,
  processPriceFeeds,
} = require('./logic/price-feeds.ent');
const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.fetchPriceFeeds = fetchPriceFeeds;
entity.processPriceFeeds = processPriceFeeds;

/**
 * Initialize frontrunner core functionality.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await log.info('Initializing Frontrunner...');
  await initHeartbeat();
};

/**
 * Dispose of all the open handlers.
 *
 */
entity.dispose = () => {
  disposeHeartbeat();
};
