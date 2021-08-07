/**
 * @fileoverview Ether Provider Service.
 */

const config = require('config');
const { ethers } = require('ethers');
const invariant = require('invariant');

const { networkConsts } = require('./constants/networks.const');

const { mainnet, polygon, kovan, optimistic_kovan } = networkConsts;

const service = (module.exports = {});

/** @type {Object?} Stores the instantiated ether.js Mainnet provider */
service._providerMainnet = null;
/** @type {Object?} Stores the instantiated ether.js Polygon provider */
service._providerPolygon = null;
/** @type {Object?} Stores the instantiated ether.js Kovan provider */
service._providerKovan = null;
/** @type {Object?} Stores the instantiated ether.js Optimism Kovan provider */
service._providerOKovan = null;

/** @type {Object?} Stores the instantiated ether.js wallet */
service._wallet = null;

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

  service._providerOKovan = new ethers.providers.JsonRpcProvider(
    optimistic_kovan.jsonRpc,
  );

  service._providerKovan = new ethers.providers.JsonRpcProvider(kovan.jsonRpc);

  service._wallet = new ethers.Wallet(
    config.ether.signer_private_key,
    service._providerOKovan,
  );
};

/**
 * Will return the appropriate ether.js provider.
 *
 * @param {Object} network The blockchain network to be used.
 * @return {Object} Appropriate ether.js provider.
 */
service.getProvider = (network) => {
  invariant(
    typeof network === 'string',
    'Wrong network type on getProvider() - Use object const',
  );

  if (network.name === 'mainnet') {
    return service._providerMainnet;
  }

  if (network.name === 'polygon') {
    return service._providerPolygon;
  }

  if (network.name === 'kovan') {
    return service._providerKovan;
  }

  throw new Error('getPrivider() :: Network does not exist');
};
