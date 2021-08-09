/**
 * @fileoverview Runtime state of open trades and decision making.
 */

const state = (module.exports = {});

/** @type {Object} local copy of the last state pushed from events-plexer */
state.lastDivergences = {};

/** @type {Object} local state with active (open) trades */
state.activeTrades = {
  // BTCUSD: {
  //  id: [...]
  //  [...] Rest of "trades" model fields
  // }
};
