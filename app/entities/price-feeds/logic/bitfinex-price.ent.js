/**
 * @fileoverview Fetches price from bitfinex.
 */

const config = require('config');
const axios = require('axios');

const { Pairs } = require('../constants/pairs.const');
const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/** @const {Array<string>} BITFINEX_TOKEN_PAIRS token pairs we care about */
entity.BITFINEX_TOKEN_PAIRS = [
  'tAAVE:USD',
  'tBTCUSD',
  'tETHUSD',
  'tLINK:USD',
  'tUNIUSD',
];

/** @const {Object<string>} BITFINEX_NORMALIZE_PAIRS Normalize BITFINEX pairs */
entity.BITFINEX_NORMALIZE_PAIRS = {
  'tAAVE:USD': Pairs.AAVEUSD,
  tBTCUSD: Pairs.LINKUSD,
  tETHUSD: Pairs.UNIUSD,
  'tLINK:USD': Pairs.ETHUSD,
  tUNIUSD: Pairs.BTCUSD,
};

/** @const {Array<string>} BITFINEX_TOKEN_PAIRS_STR pairs as string for API use */
entity.BITFINEX_TOKEN_PAIRS_STR = entity.BITFINEX_TOKEN_PAIRS.join(',');

/**
 * @const {Array<string>} TICKER_LABELS Labels of ticker results.
 * @see https://docs.bitfinex.com/reference#rest-public-tickers
 */
entity.TICKER_LABELS = [
  'SYMBOL',
  'BID',
  'BID_SIZE',
  'ASK',
  'ASK_SIZE',
  'DAILY_CHANGE',
  'DAILY_CHANGE_RELATIVE',
  'LAST_PRICE',
  'VOLUME',
  'HIGH',
  'LOW',
];

/**
 * curl https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD,tLTCUSD,fUSD
 *
 * @see https://docs.bitfinex.com/reference#rest-public-tickers
 * @const {string} API_BITFINEX_TICKER Base url for bitfinex.
 */
entity.API_BITFINEX_TICKER = `https://api-pub.bitfinex.com/v2/tickers?symbols=${entity.BITFINEX_TOKEN_PAIRS_STR}`;

/**
 * Get prices from bitfinex.
 *
 * @return {Promise<Array<Object>>} A Promise array.
 */
entity.getAllPriceBitfinex = async () => {
  try {
    const res = await axios({
      url: entity.API_BITFINEX_TICKER,
      method: 'get',
      timeout: config.app.fetch_price_timeout,
    });

    const prices = entity._parseResults(res);

    return prices;
  } catch (ex) {
    // Without await on purpose so response is faster
    log.warn('getAllPriceBitfinex() :: Error fetching prices', { error: ex });
  }
};

/**
 * Will validate, parse and normalize API results.
 *
 * @param {Object} res Raw Axios result object.
 * @return {Array<Object>} An array with normalized price results.
 * @private
 */
entity._parseResults = (res) => {
  const results = res?.data;
  const prices = {};
  results.forEach((result) => {
    const bitfinexPair = result[0];
    const bitfinexValue = result[7];

    const pairNormalized = entity.BITFINEX_NORMALIZE_PAIRS[bitfinexPair];

    prices[pairNormalized] = String(bitfinexValue);
  });

  return prices;
};
