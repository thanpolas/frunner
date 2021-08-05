/**
 * @fileoverview Coinbase service provider.
 */

const service = (module.exports = {});

/** @type {Object?} Stores the instantiated coinbase client */
service._clientCoinbase = null;

/**
 * Inialize the ether service, create the provider.
 *
 * @return {Promise<void>} A Promise.
 */
service.init = async () => {};
