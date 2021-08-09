/**
 * @fileoverview Chainlink Oracle ethereum addresses.
 */

const consts = (module.exports = {});

//
// Decimals and Deviation data from: https://docs.chain.link/docs/ethereum-addresses/
// Address data from: https://github1s.com/Synthetixio/synthetix/blob/develop/publish/deployed/kovan-ovm/feeds.json

/** @const {Object} ETH_ORACLES Ethereum Chainlink Oracles */
consts.ETH_ORACLES = {
  AAVEUSD: {
    decimals: 8,
    address: '0xc051eCEaFd546e0Eb915a97F4D0643BEd7F98a11',
    pair: 'AAVEUSD',
    deviation: 0.01,
  },
  BTCUSD: {
    decimals: 8,
    address: '0x81AE7F8fF54070C52f0eB4EB5b8890e1506AA4f4',
    pair: 'BTCUSD',
    deviation: 0.003,
  },
  ETHUSD: {
    decimals: 8,
    address: '0xCb7895bDC70A1a1Dce69b689FD7e43A627475A06',
    pair: 'ETHUSD',
    deviation: 0.005,
  },
  LINKUSD: {
    decimals: 8,
    address: '0xb37aA79EBc31B93864Bff2d5390b385bE482897b',
    pair: 'LINKUSD',
    deviation: 0.01,
  },
  UNIUSD: {
    decimals: 8,
    address: '0xbac904786e476632e75fC6214C797fA80cce9311',
    pair: 'UNIUSD',
    deviation: 0.02,
  },
};

/** @const {Array<Object>} ETH_ORACLES_AR Oracles in an Array */
consts.ETH_ORACLES_AR = Object.keys(consts.ETH_ORACLES).map(
  (key) => consts.ETH_ORACLES[key],
);
