/**
 * Get all pairs:
 * curl https://api.kraken.com/0/public/AssetPairs| jq '.result| to_entries | map(.value.altname)'
 *
 * @fileoverview Fetches price from kraken.
 * @see https://docs.kraken.com/rest/#operation/getTickerInformation
 */

const config = require('config');
const axios = require('axios');
const log = require('../../../services/log.service').get();

const { Pairs } = require('../constants/pairs.const');

const entity = (module.exports = {});

/** @const {Array<string>} KRAKEN_TOKEN_PAIRS token pairs we care about */
entity.KRAKEN_TOKEN_PAIRS = [
  'XBTUSD',
  'ETHUSD',
  'LINKUSD',
  'UNIUSD',
  'AAVEUSD',
];

/** @const {Object<string>} KRAKEN_NORMALIZE_PAIRS Normalize kraken pairs */
entity.KRAKEN_NORMALIZE_PAIRS = {
  AAVEUSD: Pairs.AAVEUSD,
  LINKUSD: Pairs.LINKUSD,
  UNIUSD: Pairs.UNIUSD,
  XETHZUSD: Pairs.ETHUSD,
  XXBTZUSD: Pairs.BTCUSD,
};

/**
 * curl "https://api.kraken.com/0/public/Ticker?pair=XBTUSD"
 *
 * @see https://docs.kraken.com/rest/#operation/getTickerInformation
 * @const {string} API_KRAKEN_URL Base price url for kraken.
 */
entity.API_KRAKEN_URL = 'https://api.kraken.com/0/public/Ticker?pair=';

/** @const {Array<string>} ALL_PRICES_URLS Prepare all pair urls */
entity.ALL_PRICES_URL =
  entity.API_KRAKEN_URL + entity.KRAKEN_TOKEN_PAIRS.join(',');

/**
 * Get prices from kraken.
 *
 * Use curl:
 * curl "https://api.kraken.com/0/public/Ticker?pair=XBTUSD"|jq '.result| to_entries | map(.key,.value.a[0],.value.b[0],.value.c[0])'
 *
 * @return {Promise<Array<Object>>} A Promise array with the prices.
 */
entity.getAllPricesKraken = async () => {
  try {
    const res = await axios({
      url: entity.ALL_PRICES_URL,
      method: 'get',
      timeout: config.app.fetch_price_timeout,
    });

    const prices = entity._parseResults(res);

    return prices;
  } catch (ex) {
    // Without await on purpose so response is faster
    log.warn('getAllPricesKraken() :: Error fetching prices', { error: ex });
  }
};

/**
 * Will validate, parse and normalize kraken's API results.
 *
 * @param {Object} res Kraken API response.
 * @return {Array<Object>} An array with normalized price results.
 * @private
 */
entity._parseResults = (res) => {
  const { data } = res;
  const prices = {};

  // check for errors
  if (data.error.length) {
    return;
  }

  const { result } = data;

  const pairKeys = Object.keys(result);

  pairKeys.forEach((pairKey) => {
    const normalizedPair = entity.KRAKEN_NORMALIZE_PAIRS[pairKey];

    // eslint-disable-next-line prefer-destructuring
    prices[normalizedPair] = result[pairKey].c[0];
  });

  return prices;
};

//
// Kraken response schema
//

// a
// Array of strings
// Ask [<price>, <whole lot volume>, <lot volume>]

// b
// Array of strings
// Bid [<price>, <whole lot volume>, <lot volume>]

// c
// Array of strings
// Last trade closed [<price>, <lot volume>]

// v
// Array of strings
// Volume [<today>, <last 24 hours>]

// p
// Array of strings
// Volume weighted average price [<today>, <last 24 hours>]

// t
// Array of integers
// Number of trades [<today>, <last 24 hours>]

// l
// Array of strings
// Low [<today>, <last 24 hours>]

// h
// Array of strings
// High [<today>, <last 24 hours>]

// o
// string
// Today's opening price
