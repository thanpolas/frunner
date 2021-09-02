/**
 * @fileoverview Open - Close trading strategy event handler.
 */

const { opportunities } = require('./open-trade.ent');
const { closeTrades } = require('./close-trade.ent');
const { LogEvents } = require('../../../events');
const { getOpenTrades } = require('../../sql/trades.sql');

const log = require('../../../../services/log.service').get();

const { DECISION_ENDED } = LogEvents;

const entity = (module.exports = {});

/** @type {Object} local state with active (open) trades */
entity.activeTrades = {
  // BTCUSD: {
  //  id: [...]
  //  [...] Rest of "trades" model fields
  // }
};

/** @type {boolean} Toggle to ensure determineAction will not have duplicate runs */
entity._decisionRunning = false;

/**
 * Warm up the local state from DB.
 *
 * @return {Promise<void>} An empty promise.
 */
entity.init = async () => {
  await log.info('Initializing open-close decision maker...');
  const openTrades = await getOpenTrades();

  if (openTrades.length === 0) {
    return;
  }

  const { activeTrades } = entity;

  openTrades.forEach((openTrade) => {
    if (activeTrades[openTrade.pair]) {
      throw new Error(
        `Database in broken state, duplicate open order found for ${openTrade.pair}`,
      );
    }

    activeTrades[openTrade.pair] = openTrade;
  });
};

/**
 * Will determine if an action needs to be taken based on the divergencies
 * and the current stored trading state.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @return {Promise<Object>} A Promise with two array keys: "openedTrades" and
 *    "closedTrades".
 * @private
 */
entity.determineActionOpenClose = async (divergencies) => {
  const result = {
    openedTrade: null,
    closedTrade: null,
  };

  if (entity._decisionRunning) {
    return result;
  }
  entity._decisionRunning = true;

  const [openedTrade, closedTrade] = await Promise.all([
    opportunities(divergencies, entity.activeTrades),
    closeTrades(divergencies, entity.activeTrades),
  ]);

  result.openedTrade = openedTrade;
  result.closedTrade = closedTrade;

  entity._decisionRunning = false;

  await entity.logResults(divergencies, result);

  return result;
};

/**
 * Will log the divergencies in a human readable format.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} result The decision making result.
 * @return {Promise<void>}
 * @private
 */
entity.logResults = async (divergencies, result) => {
  const { openedTrade, closedTrade } = result;

  if (!openedTrade && !closedTrade) {
    return;
  }

  await log.info('Decision Making Ended', {
    openedTrade,
    closedTrade,
    divergencies,
    relay: DECISION_ENDED,
  });
};
