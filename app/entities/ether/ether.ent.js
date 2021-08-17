/**
 * @fileoverview Ether base functionality and logic.
 */

const { networkConsts } = require('./constants/networks.const');
const etherService = require('./ether.service');
const { DEFAULT_GAS_BUFFER } = require('./constants/ether.const');
const log = require('../../services/log.service').get();
const erc20GenericAbi = require('./abi/erc20generic.abi.json');

const entity = (module.exports = {});

entity.network = networkConsts;

entity.getProvider = etherService.getProvider;
entity.getSigner = etherService.getSigner;

// ABIs
entity.erc20GenericAbi = erc20GenericAbi;

// constants
entity.DEFAULT_GAS_BUFFER = DEFAULT_GAS_BUFFER;

/**
 * Initialize the ether entity and service.
 *
 * @return {Promise}
 */
entity.init = async () => {
  await log.info('Initializing Ether entity...');
  await etherService.init();
};
