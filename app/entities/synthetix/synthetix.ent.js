/**
 * @fileoverview Synthetix entities and business logic.
 */

const log = require('../../services/log.service').get();

const { init: initService } = require('./synthetix.service');
const { init: initPrices, snxPrices } = require('./logic/snx-price.ent');
const { init: initTrade, snxTrade } = require('./logic/snx-trade.ent');
const {
  init: initBalances,
  balances,
  getBalances,
  getCurrentTokenSymbol,
} = require('./logic/snx-balances.ent');
const { SynthsSymbols, SYNTH_DECIMALS } = require('./constants/synths.const');

const entity = (module.exports = {});

entity.snxPrices = snxPrices;
entity.snxTrade = snxTrade;
entity.balances = balances;
entity.getBalances = getBalances;
entity.getCurrentTokenSymbol = getCurrentTokenSymbol;

entity.SYNTH_DECIMALS = SYNTH_DECIMALS;
entity.SynthsSymbols = SynthsSymbols;

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
};
