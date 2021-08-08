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
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise<void>}
 */
entity.init = async (bootOpts) => {
  await log.info('Initializing Frontrunner...');
  await initHeartbeat(bootOpts);
};

/**
 * Dispose of all the open handlers.
 *
 */
entity.dispose = () => {
  disposeHeartbeat();
};
