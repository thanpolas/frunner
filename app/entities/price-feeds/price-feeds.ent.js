/**
 * @fileoverview Price feeds fetcher and aggregator.
 */

const priceFeedService = require('./price-feed.service');
const log = require('../../services/log.service').get();

const entity = (module.exports = {});

/**
 * Initialize the entity and service.
 *
 * @return {Promise}
 */
entity.init = async () => {
  await log.info('Initializing price-feeds entity...');

  await priceFeedService.init();
};
