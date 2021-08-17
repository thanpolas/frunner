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
service._providerOPKovan = null;

/** @type {Object?} Stores the instantiated ether.js wallet */
service._signer = null;

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

  service._providerOPKovan = new ethers.providers.JsonRpcProvider(
    optimistic_kovan.jsonRpc,
  );

  service._providerKovan = new ethers.providers.JsonRpcProvider(kovan.jsonRpc);

  service._signer = new ethers.Wallet(
    config.ether.signer_private_key,
    service._providerOPKovan,
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
    typeof network?.name === 'string',
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
  if (network.name === 'optimistic_kovan') {
    return service._providerOPKovan;
  }

  throw new Error('getProvider() :: Network does not exist');
};

/**
 * Will return the appropriate ether.js signer.
 *
 * @param {Object} network The network to be used.
 * @return {Object} Appropriate ether.js signer.
 */
service.getSigner = (network) => {
  invariant(
    typeof network?.name === 'string',
    'Wrong network type on getSigner() - Use object const',
  );

  if (network.name === 'optimistic_kovan') {
    return service._signer;
  }

  throw new Error('getSigner() :: Network does not exist');
};
