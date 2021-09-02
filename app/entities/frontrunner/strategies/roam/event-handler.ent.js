/**
 * @fileoverview Handles events and local runtime state of roam trading.
 */

const { findOpportunity } = require('./trade-roam.ent');
const { closeTradeRoam } = require('./close-trade-roam.ent');
const { LogEvents } = require('../../../events');
const { getOpenTrades } = require('../../sql/trades-roam.sql');

const log = require('../../../../services/log.service').get();

const { ROAM_TRADE_EVENT_HANDLED } = LogEvents;

const entity = (module.exports = {});

/** @type {Object} local state with the active opportunity */
entity.activeOpportunity = null;

/** @type {boolean} Toggle to ensure determineAction will not have duplicate runs */
entity._decisionRunning = false;

/**
 * Warm up the local state from DB.
 *
 * @return {Promise<void>} An empty promise.
 */
entity.init = async () => {
  await log.info('Initializing trading roam event handler...');
  const openTrades = await getOpenTrades();

  if (openTrades.length === 0) {
    return;
  }

  if (openTrades.length !== 1) {
    throw new Error(
      `More than 1 (${openTrades.length} open roam-trades found)`,
    );
  }

  [entity.activeOpportunity] = openTrades;
};

/**
 * Will determine if an action needs to be taken based on the divergencies
 * and the currently stored trading state.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @return {Promise<Object>} A Promise with two array keys: "openedTrades" and
 *    "closedTrades".
 * @private
 */
entity.determineActionRoam = async (divergencies) => {
  const result = {
    openedTrade: null,
    closedTrade: null,
  };

  if (entity._decisionRunning) {
    return result;
  }
  entity._decisionRunning = true;

  const [openedTrade, closedTrade] = await Promise.all([
    findOpportunity(divergencies, entity.activeOpportunity),
    closeTradeRoam(divergencies, entity.activeOpportunity),
  ]);

  result.openedTrade = openedTrade;
  result.closedTrade = closedTrade;

  if (openedTrade) {
    entity.activeOpportunity = openedTrade;
  }
  if (closedTrade) {
    entity.activeOpportunity = null;
  }

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
  const { closedTrade } = result;

  if (!closedTrade) {
    return;
  }

  await log.info('Event Handled for roaming trade', {
    closedTrade,
    divergencies,
    relay: ROAM_TRADE_EVENT_HANDLED,
  });
};
