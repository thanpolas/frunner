/**
 * @fileoverview Decision maker.
 */

const { opportunities } = require('./decision-making/opportunities.ent');
const { closeTrades } = require('./decision-making/close-trades.ent');
const { LogEvents } = require('../../events');

const log = require('../../../services/log.service').get();

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
entity.init = async () => {};

/**
 * Will determine if an action needs to be taken based on the divergences
 * and the current stored trading state.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Promise<Object>} A Promise with two array keys: "openedTrades" and
 *    "closedTrades".
 * @private
 */
entity.determineAction = async (divergences) => {
  const result = {
    openedTrades: [],
    closedTrades: [],
  };

  if (entity._decisionRunning) {
    return result;
  }
  entity._decisionRunning = true;

  const [openedTrades, closedTrades] = await Promise.all([
    opportunities(divergences, entity.activeTrades),
    closeTrades(divergences, entity.activeTrades),
  ]);

  result.openedTrades = openedTrades;
  result.closedTrades = closedTrades;

  entity._decisionRunning = false;

  await entity.logResults(divergences, result);

  return result;
};

/**
 * Will log the divergences in a human readable format.
 *
 * @param {Object} divergences The calculated divergences.
 * @param {Object} result The decision making result.
 * @return {Promise<void>}
 * @private
 */
entity.logResults = async (divergences, result) => {
  const { openedTrades, closedTrades } = result;

  if (openedTrades.length === 0 && closedTrades.length === 0) {
    return;
  }

  await log.info('Decision Making Ended', {
    openedTrades,
    closedTrades,
    divergences,
    relay: DECISION_ENDED,
  });
};
