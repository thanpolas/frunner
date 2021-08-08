/**
 * @fileoverview Chainlink Oracle ethereum addresses.
 */

const consts = (module.exports = {});

/** @const {Object} ETH_ORACLES Ethereum Chainlink Oracles */
consts.ETH_ORACLES = {
  AAVEUSD: {
    decimals: 8,
    address: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
    pair: 'AAVEUSD',
  },
  BTCUSD: {
    decimals: 8,
    address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    pair: 'BTCUSD',
  },
  ETHUSD: {
    decimals: 8,
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    pair: 'ETHUSD',
  },
  LINKUSD: {
    decimals: 8,
    address: '	0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
    pair: 'LINKUSD',
  },
  UNIUSD: {
    decimals: 8,
    address: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
    pair: 'UNIUSD',
  },
};

/** @const {Array<Object>} ETH_ORACLES_AR Oracles in an Array */
consts.ETH_ORACLES_AR = Object.keys(consts.ETH_ORACLES).map(
  (key) => consts.ETH_ORACLES[key],
);
