/**
 * @fileoverview Fetches price from bitfinex.
 */

const axios = require('axios');

const entity = (module.exports = {});

/** @const {Array<string>} BITFINEX_TOKEN_PAIRS token pairs we care about */
entity.BITFINEX_TOKEN_PAIRS = [
  't1INCH:USD',
  'tAAVE:USD',
  'tADAUSD',
  'tBTCUSD',
  'tCOMP:UST',
  'tDOTUSD',
  'tEOSUSD',
  'tETCUSD',
  'tETHUSD',
  'tLINK:USD',
  'tLTCUSD',
  'tTRXUSD',
  'tUNIUSD',
  'tXMRUSD',
  'tXRPUSD',
  'tYFIUSD',
];

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
entity.API_BITFINEX_TICKER = 'https://api-pub.bitfinex.com/v2/tickers?symbols=';

/**
 * Get prices from bitfinex.
 *
 * @return {Promise<Array<string>>} A Promise array.
 */
entity.getAllPriceBitfinex = async () => {
  const url = `${entity.API_BITFINEX_TICKER}${entity.BITFINEX_TOKEN_PAIRS_STR}`;

  const res = await axios.get(url);

  const results = res?.data;

  const resLabeled = results.map((ticker) => {
    const tickerLabeled = ticker.reduce((obj, field, index) => {
      const label = entity.TICKER_LABELS[index];
      obj[label] = field;
      return obj;
    }, {});
    return tickerLabeled;
  });

  return resLabeled;
};
