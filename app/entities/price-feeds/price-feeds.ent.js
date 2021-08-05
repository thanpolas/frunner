/**
 * @fileoverview Price feeds fetcher and aggregator.
 */

const priceFeedService = require('./price-feed.service');

const { getPriceCoinbase } = require('./logic/coinbase-price.ent');

const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.getPriceCoinbase = getPriceCoinbase;

/**
 * Initialize the entity and service.
 *
 * @return {Promise}
 */
entity.init = async () => {
  await log.info('Initializing price-feeds entity...');

  await priceFeedService.init();
};
