/**
 * @fileoverview Opportunities fixtures.
 */

const fix = (module.exports = {});

fix.allOpportunities = () => [
  {
    pair: 'ETHUSD',
    divergence: 0.00383,
    blockNumber: 1090787,
    oraclePrice: 3134,
    feedPrice: 3146,
    traded_projected_percent: 0.00383,
  },
  {
    pair: 'AAVEUSD',
    divergence: 0.002806032690400695,
    blockNumber: 1090787,
    oraclePrice: 416.84,
    feedPrice: 418.00966666666665,
    traded_projected_percent: 0.002806032690400695,
  },
  {
    pair: 'LINKUSD',
    divergence: 0.004210237526200977,
    blockNumber: 1090787,
    oraclePrice: 27.65323,
    feedPrice: 27.769656666666666,
    traded_projected_percent: 0.004210237526200977,
  },
];
