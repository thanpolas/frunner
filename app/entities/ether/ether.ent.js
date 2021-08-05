/**
 * @fileoverview Ether base functionality and logic.
 */

const { networkConsts } = require('./constants/networks.const');
const etherService = require('./ether.service');
const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.network = networkConsts;

entity.getProvider = etherService.getProvider;

/**
 * Initialize the ether entity and service.
 *
 * @return {Promise}
 */
entity.init = async () => {
  await log.info('Initializing Ether entity...');
  await etherService.init();
};
