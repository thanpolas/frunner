/**
 * @fileoverview Price feeds fetcher and aggregator.
 */

const { getAllPricesCoinbase } = require('./logic/coinbase-price.ent');
const { getAllPriceBitfinex } = require('./logic/bitfinex-price.ent');
const { getAllPricesKraken } = require('./logic/kraken-price.ent');
const { PAIRS } = require('./constants/pairs.const');

const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.getAllPricesCoinbase = getAllPricesCoinbase;
entity.getAllPriceBitfinex = getAllPriceBitfinex;
entity.getAllPricesKraken = getAllPricesKraken;
entity.PAIRS = PAIRS;

/**
 * Initialize the entity and service.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await log.info('Initializing price-feeds entity...');
};
