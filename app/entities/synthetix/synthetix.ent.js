/**
 * @fileoverview Synthetix entities and business logic.
 */

const log = require('../../services/log.service').get();

const { init: initService } = require('./synthetix.service');
const { init: initPrices, snxPrices } = require('./logic/snx-price.ent');
const { init: initTrade, snxTrade } = require('./logic/snx-trade.ent');
const { init: initBalances } = require('./logic/snx-balances.ent');
// const { init: initApprove } = require('./logic/snx-approve.ent');

const entity = (module.exports = {});

entity.snxPrices = snxPrices;
entity.snxTrade = snxTrade;

/**
 * Initialize synthetix service.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await log.info('Initializing synthetix...');
  await initService();
  initPrices();
  await initBalances();
  await initTrade();

  // await initApprove();
};
