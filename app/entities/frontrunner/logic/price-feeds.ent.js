/**
 * @fileoverview Fetches and aggregates price feeds.
 */

const { allPriceFeeds, PAIRS_AR } = require('../../price-feeds');

const {
  asyncMapCap,
  arrToNumbers,
  meanOfArr,
} = require('../../../utils/helpers');

const entity = (module.exports = {});

/**
 * Will fetch and aggregate the external price feeds.
 *
 * @return {Promise<Array<Object>>} A Promise with an array of all the feed results.
 */
entity.fetchPriceFeeds = async () => {
  const allFeeds = await asyncMapCap(allPriceFeeds, async (priceFeed) => {
    const res = {
      source: priceFeed.source,
      prices: await priceFeed.fn(),
    };

    return res;
  });

  // Check prices were received from all sources
  let allSources = true;
  allFeeds.forEach(({ prices }) => {
    if (!prices) {
      allSources = false;
    }
  });
  if (!allSources) {
    return;
  }

  return allFeeds;
};

/**
 * Will calculate the mean price for each of the token pair from all the
 * price feeds.
 *
 * @param {Array<Oject>} allPriceFeedRes All the price feeds fetched.
 * @return {Object} A single object with the token pairs as keys and their mean
 *    price as values.
 */
entity.processPriceFeeds = (allPriceFeedRes) => {
  // build the result object.
  const result = PAIRS_AR.reduce((obj, source) => {
    obj[source] = 0;
    return obj;
  }, {});

  // Stores all the values per token pair. {BTCUSD: [p1, p2, p3]}
  const valuesPerTokenPair = {};
  allPriceFeedRes.forEach((priceFeed) => {
    PAIRS_AR.forEach((pair) => {
      const price = priceFeed.prices[pair];
      if (valuesPerTokenPair[pair]) {
        valuesPerTokenPair[pair].push(price);
      } else {
        valuesPerTokenPair[pair] = [price];
      }
    });
  });

  // Calculate the mean price.
  // NOTE: Link calculates the median price but they use dozens of feeds.
  //    Frontrunner only uses a few sources from major CEXes so mean value
  //    makes more sense.

  PAIRS_AR.forEach((pair) => {
    const valuesPerTokenPairNumbers = arrToNumbers(valuesPerTokenPair[pair]);
    result[pair] = meanOfArr(valuesPerTokenPairNumbers);
  });

  return result;
};
