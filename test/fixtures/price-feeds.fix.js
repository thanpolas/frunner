/**
 * @fileoverview Fixtures for price feeds.
 */

const fixture = (module.exports = {});

fixture.allPriceFeedRes = [
  {
    source: 'coinbase',
    prices: {
      BTCUSD: '44420.54',
      ETHUSD: '3101.06',
      LINKUSD: '24.34831',
      UNIUSD: '27.7587',
      AAVEUSD: '374.85',
    },
  },
  {
    source: 'kraken',
    prices: {
      AAVEUSD: '374.51000',
      LINKUSD: '24.330690',
      UNIUSD: '27.74000',
      ETHUSD: '3100.62000',
      BTCUSD: '44373.70000',
    },
  },
  {
    source: 'bitfinex',
    prices: {
      AAVEUSD: '374.44',
      BTCUSD: '44331',
      ETHUSD: '3096.3',
      LINKUSD: '24.28',
      UNIUSD: '27.703',
    },
  },
];

/**
 * Mean for each tokenpair
 */
fixture.allPriceFeedResResults = {
  AAVEUSD: 374.59999999999997,
  LINKUSD: 24.319666666666667,
  UNIUSD: 27.733900000000002,
  ETHUSD: 3099.3266666666664,
  BTCUSD: 44375.079999999994,
};
