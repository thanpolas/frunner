/**
 * @fileoverview Ethereum networks.
 */
const config = require('config');

const consts = (module.exports = {});

consts.networkConsts = {
  mainnet: {
    name: 'mainnet',
    chain: 'ETH',
    chainId: 1,
    networkId: 1,
    type: 'Production',
    jsonRpc: config.ether.rpc_provider_mainnet,
    explorer: 'https://etherscan.com/',
  },
  polygon: {
    name: 'polygon',
    chain: 'polygon',
    chainId: 137,
    networkId: 137,
    type: 'Production',
    jsonRpc: config.ether.rpc_provider_polygon,
    explorer: 'https://polygonscan.com/',
  },
  optimism: {
    name: 'optimism',
    chain: 'optimism',
    chainId: 10,
    networkId: 10,
    type: 'Production',
    jsonRpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
  },
  kovan: {
    name: 'kovan',
    chain: 'optimism',
    chainId: 69,
    networkId: 10,
    type: 'Test',
    jsonRpc: config.ether.rpc_provider_kovan,
    explorer: 'https://kovan-explorer.optimism.io/',
  },
  optimistic_kovan: {
    name: 'optimistic_kovan',
    chain: 'optimism',
    chainId: 69,
    networkId: 10,
    type: 'Test',
    jsonRpc: 'https://kovan.optimism.io',
    explorer: 'https://kovan-optimistic.etherscan.io',
  },

  ropsten: {
    name: 'ropsten',
    chain: 'ETH',
    chainId: 3,
    networkId: 3,
    type: 'Test',
  },
  rinkeby: {
    name: 'rinkeby',
    chain: 'ETH',
    chainId: 4,
    networkId: 4,
    type: 'Test',
  },
  goerli: {
    name: 'goerli',
    chain: 'ETH',
    chainId: 5,
    networkId: 5,
    type: 'Test',
  },
  dev: {
    name: 'dev',
    chain: 'ETH',
    chainId: 2018,
    networkId: 2018,
    type: 'Development',
  },
  classic: {
    name: 'classic',
    chain: 'ETC',
    chainId: 61,
    networkId: 1,
    type: 'Production',
  },
  mordor: {
    name: 'mordor',
    chain: 'ETC',
    chainId: 63,
    networkId: 7,
    type: 'Test',
  },
  kotti: {
    name: 'kotti',
    chain: 'ETC',
    chainId: 6,
    networkId: 6,
    type: 'Test',
  },
  astor: {
    name: 'astor',
    chain: 'ETC',
    chainId: 212,
    networkId: 212,
    type: 'Test',
  },
};

const networkNames = Object.keys(consts.networkConsts);

/**
 * @const {Object} networksByChainId Networks indexed by chain Id.
 */
consts.networksByChainId = networkNames.reduce((obj, networkName) => {
  const network = consts.networkConsts[networkName];
  obj[network.chainId] = network;
  return obj;
}, {});
