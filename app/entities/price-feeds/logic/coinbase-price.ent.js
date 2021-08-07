/**
 * @fileoverview Fetches price of coinbase.
 */

const axios = require('axios');

const entity = (module.exports = {});

entity.API_COINBASE_BASE = 'https://api.coinbase.com/v2/prices/';

/**
 * Get the price of coinbase.
 *
 * @param {string=} currencyPair The currency pair to fetch price for.
 * @return {Promise<string>} A Promise.
 */
entity.getPriceCoinbase = async (currencyPair = 'BTC-USD') => {
  const url = `${entity.API_COINBASE_BASE}${currencyPair}/spot`;

  const res = await axios.get(url);

  return res?.data?.data?.amount;
};
