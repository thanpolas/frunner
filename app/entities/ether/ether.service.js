/**
 * @fileoverview Ether Provider Service.
 */
const { ethers } = require('ethers');

const { networkConsts } = require('./constants/networks.const');

const { mainnet, polygon, kovan } = networkConsts;

const service = (module.exports = {});

/** @type {Object?} Stores the instantiated ether.js Mainnet provider */
service._providerMainnet = null;
/** @type {Object?} Stores the instantiated ether.js Polygon provider */
service._providerPolygon = null;
/** @type {Object?} Stores the instantiated ether.js Kovan provider */
service._providerKovan = null;
/**
 * Inialize the ether service, create the provider.
 *
 * @return {Promise<void>} A Promise.
 */
service.init = async () => {
  service._providerMainnet = new ethers.providers.JsonRpcProvider(
    mainnet.jsonRpc,
  );

  service._providerPolygon = new ethers.providers.JsonRpcProvider(
    polygon.jsonRpc,
  );

  service._providerKovan = new ethers.providers.JsonRpcProvider(kovan.jsonRpc);
};

/**
 * Will return the appropriate ether.js provider.
 *
 * @param {Object} network The blockchain network to be used.
 * @return {Object} Appropriate ether.js provider.
 */
service.getProvider = (network) => {
  if (typeof network === 'string') {
    throw new Error('Wrong network type on getProvider() - Use object const');
  }
  if (network.name === 'mainnet') {
    return service._providerMainnet;
  }

  if (network.name === 'polygon') {
    return service._providerPolygon;
  }

  if (network.name === 'kovan') {
    return service._providerKovan;
  }
};
