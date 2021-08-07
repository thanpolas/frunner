/**
 * @fileoverview Fetches price of coinbase.
 * @see https://developers.coinbase.com/api/v2#get-spot-price
 */

const config = require('config');
const axios = require('axios');
const log = require('../../../services/log.service').get();

const { PAIRS } = require('../constants/pairs.const');

const entity = (module.exports = {});

/** @const {Array<string>} COINBASE_TOKEN_PAIRS token pairs we care about */
entity.COINBASE_TOKEN_PAIRS = [
  'BTC-USD',
  'ETH-USD',
  'LINK-USD',
  'UNI-USD',
  'AAVE-USD',
];

/** @const {Object<string>} COINBASE_NORMALIZE_PAIRS Normalize coinbase pairs */
entity.COINBASE_NORMALIZE_PAIRS = {
  AAVEUSD: PAIRS.AAVEUSD,
  LINKUSD: PAIRS.LINKUSD,
  UNIUSD: PAIRS.UNIUSD,
  ETHUSD: PAIRS.ETHUSD,
  BTCUSD: PAIRS.BTCUSD,
};

entity.API_COINBASE_BASE = 'https://api.coinbase.com/v2/prices/';
entity.ALL_URLS = entity.COINBASE_TOKEN_PAIRS.map(
  (tokenPair) => `${entity.API_COINBASE_BASE}${tokenPair}/spot`,
);
/**
 * Get all prices from coinbase.
 *
 * Use curl:
 * curl https://api.coinbase.com/v2/prices/BTC-USD/spot
 *
 * @return {Promise<Array<Object>>} A Promise array with the prices.
 */
entity.getAllPricesCoinbase = async () => {
  try {
    const allRequests = entity.ALL_URLS.map((url) => {
      return axios({
        url,
        method: 'get',
        timeout: config.app.fetch_price_timeout,
      });
    });

    const allRes = await Promise.all(allRequests);
    const prices = entity._parseResults(allRes);

    return prices;
  } catch (ex) {
    // Without await on purpose so response is faster
    log.warn('getAllPricesCoinbase() :: Error fetching prices', { error: ex });
  }
};

/**
 * Will validate, parse and normalize coinbase's API results.
 *
 * @param {Array<Object>} allRes Raw Axios result objects.
 * @return {Array<Object>} An array with normalized price results.
 * @private
 */
entity._parseResults = (allRes) => {
  const prices = {};
  allRes.forEach((res) => {
    const response = res?.data?.data;

    // check for errors
    if (!response) {
      return;
    }

    const pair = response.base + response.currency;

    const pairNormalized = entity.COINBASE_NORMALIZE_PAIRS[pair];
    prices[pairNormalized] = response.amount;
  });
  return prices;
};
