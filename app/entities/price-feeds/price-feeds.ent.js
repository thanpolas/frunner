/**
 * @fileoverview Price feeds fetcher and aggregator.
 */

const {
  init: initBitfinexWs,
  dispose: disposeBitfinexWs,
} = require('./websocket-api/bitfinex-ws.ent');

const { getAllPricesCoinbase } = require('./rest-api/coinbase-price.ent');
const { getAllPriceBitfinex } = require('./rest-api/bitfinex-price.ent');
const { getAllPricesKraken } = require('./rest-api/kraken-price.ent');
const {
  Pairs,
  PAIRS_AR,
  PairsToSynths,
  SynthsToPairs,
} = require('./constants/pairs.const');
const { Sources, SOURCES_AR } = require('./constants/sources.const');

const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.getAllPricesCoinbase = getAllPricesCoinbase;
entity.getAllPriceBitfinex = getAllPriceBitfinex;
entity.getAllPricesKraken = getAllPricesKraken;
entity.allPriceFeeds = [
  {
    source: Sources.COINBASE,
    fn: getAllPricesCoinbase,
  },
  {
    source: Sources.KRAKEN,
    fn: getAllPricesKraken,
  },
  {
    source: Sources.BITFINEX,
    fn: getAllPriceBitfinex,
  },
];

// Constants and Enums
entity.Pairs = Pairs;
entity.PAIRS_AR = PAIRS_AR;
entity.Sources = Sources;
entity.SOURCES_AR = SOURCES_AR;
entity.PairsToSynths = PairsToSynths;
entity.SynthsToPairs = SynthsToPairs;

/**
 * Initialize the entity and service.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await log.info('Initializing price-feeds entity...');

  await initBitfinexWs();
};

/**
 * Dispose all open handlers.
 */
entity.dispose = () => {
  disposeBitfinexWs();
};
