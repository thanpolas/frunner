/**
 * @fileoverview Fetches prices of synths.
 */

const { getClient } = require('../synthetix.service');
const { Pairs } = require('../../price-feeds');

const entity = (module.exports = {});

/** @const {Array<string>} SNX_TOKENS SNX tokens we care about */
entity.SNX_TOKENS = ['sBTC', 'sETH', 'sLINK', 'sUNI', 'sAAVE'];

/** @const {Object<string>} NORMALIZED_PAIRS Normalized pairs */
entity.NORMALIZED_PAIRS = {
  sBTC: Pairs.BTCUSD,
  sETH: Pairs.ETHUSD,
  sLINK: Pairs.LINKUSD,
  sUNI: Pairs.UNIUSD,
  sAAVE: Pairs.AAVEUSD,
};

/** @type {Array<Object>} Prepopulate all pairs as byte32 type on initialization */
entity.PAIRS_TO_BYTE32 = [];

/**
 * Warm up the caches.
 *
 */
entity.init = () => {
  const snxjs = getClient();
  entity.PAIRS_TO_BYTE32 = entity.SNX_TOKENS.map((token) =>
    snxjs.toBytes32(token),
  );
};

/**
 * Fetches prices for SNX synths.
 *
 * @return {Promise<void>} A Promise.
 */
entity.snxPrices = async () => {
  const snxjs = getClient();
  const blockOptions = {};

  const promises = entity.PAIRS_TO_BYTE32.map((byte32Token) => {
    return snxjs.contracts.ExchangeRates.rateForCurrency(
      byte32Token,
      blockOptions,
    );
  });

  const allRes = await Promise.all(promises);

  const snxPrices = entity._parseResults(allRes, snxjs);

  return snxPrices;
};

/**
 * Will validate, parse and normalize SNX synth price results.
 *
 * @param {Array<string>} allRes On chain price results for SNX synths.
 * @param {Object} snxjs DI SNX client.
 * @return {Object<string>} Normalized price object.
 * @private
 */
entity._parseResults = (allRes, snxjs) => {
  // check for errors
  if (!allRes.length) {
    return;
  }

  const { formatEther } = snxjs.utils;

  const prices = {};
  allRes.forEach((unformattedSnxPrice, index) => {
    const snxToken = entity.SNX_TOKENS[index];
    const normalizedPair = entity.NORMALIZED_PAIRS[snxToken];
    const snxPrice = formatEther(unformattedSnxPrice);
    prices[normalizedPair] = snxPrice;
  });
  return prices;
};
