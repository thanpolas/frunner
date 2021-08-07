/**
 * @fileoverview Synthetix entities and business logic.
 */

const log = require('../../services/log.service').get();

const { init: initService } = require('./synthetix.service');
const { init: initPrices, snxPrices } = require('./logic/snx-price.ent');

const entity = (module.exports = {});

entity.snxPrices = snxPrices;

/**
 * Initialize synthetix service.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await log.info('Initializing synthetix...');
  await initService();
  initPrices();
};
