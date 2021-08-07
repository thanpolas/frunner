/**
 * @fileoverview Price feeds fetcher and aggregator.
 */

const { getPriceCoinbase } = require('./logic/coinbase-price.ent');
const { getPriceBitfinex } = require('./logic/bitfinex-price.ent');
const { getAllPricesKraken } = require('./logic/kraken-price.ent');

const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.getPriceCoinbase = getPriceCoinbase;
entity.getPriceBitfinex = getPriceBitfinex;
entity.getAllPricesKraken = getAllPricesKraken;

/**
 * Initialize the entity and service.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await log.info('Initializing price-feeds entity...');
};
