/**
 * @fileoverview Provides synthetix client instance.
 */
const invariant = require('invariant');
const { synthetix } = require('@synthetixio/contracts-interface');

const { getSigner, network } = require('../ether');

const service = (module.exports = {});

/** @type {Object?} SNX Client */
service._snxjs = null;

service.init = async () => {
  const signer = getSigner(network.optimistic_kovan);
  const signerNetwork = await signer.provider.getNetwork();
  service._snxjs = synthetix({ signer, networkId: signerNetwork.chainId });
};

/**
 * Gets the SNX client.
 *
 * @return {Object} The SNX client.
 */
service.getClient = () => {
  invariant(!!service._snxjs, 'Synthetix client has not been initialized yet');
  return service._snxjs;
};
