/**
 * @fileoverview Decision maker.
 */

const { opportunities } = require('./decision-making/opportunities.ent');
const state = require('./decision-making/decision-state.ent');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

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
  // const lastBlock = state.lastDivergences?.state?.blockNumber;

  state.lastDivergences = divergences;

  const [openedTrades] = await Promise.all([
    opportunities(divergences),
    // entity._checkCloseTrades(lastBlock, divergences),
  ]);

  result.openedTrades = openedTrades;

  return result;
};

/**
 * Will log the divergences in a human readable format.
 *
 * @param {Object} divergences The calculated divergences.
 * @return {Promise<void>}
 * @private
 */
entity._logHumanReadable = async (divergences) => {
  const { oracleToFeed } = divergences;

  const oracleToFeedHR = entity._convertToHumarReadable(oracleToFeed);
  await log.info('Received processed prices.', {
    custom: {
      oracleToFeedHR,
    },
  });
};

/**
 * Convert divergence values of a set of pair to human readable format.
 *
 * @param {Object<string>} singleSetDivergence A single set of divergence of pairs.
 * @return {Object<string>} Same set woth values converted to human readable form.
 * @private
 */
entity._convertToHumarReadable = (singleSetDivergence) => {
  const pairs = Object.keys(singleSetDivergence);

  const hr = {};
  pairs.forEach((pair) => {
    hr[pair] = `${(singleSetDivergence[pair] * 100).toFixed(2)}%`;
  });

  return hr;
};
