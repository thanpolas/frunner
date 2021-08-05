/**
 * @fileoverview Coinbase service provider.
 */

const coinbase = require('coinbase');
const invariant = require('invariant');

const service = (module.exports = {});

/** @type {Object?} Stores the instantiated coinbase client */
service._client = null;

/**
 * Inialize the ether service, create the provider.
 *
 * @return {Promise<void>} A Promise.
 */
service.init = async () => {
  service._client = new coinbase.Client();
};

/**
 * Will return the coinbase client.
 *
 * @return {Object} The coinbase client.
 */
service.getClient = () => {
  invariant(!!service._client, 'Coinbase client not initialized');
  return service._client;
};
