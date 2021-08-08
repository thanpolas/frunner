/**
 * @fileoverview Internal normalized pairs.
 */

const consts = (module.exports = {});

/** @enum {string} Internal normalized pairs. */
consts.Pairs = {
  BTCUSD: 'BTCUSD',
  ETHUSD: 'ETHUSD',
  LINKUSD: 'LINKUSD',
  UNIUSD: 'UNIUSD',
  AAVEUSD: 'AAVEUSD',
};

/** @const {Array<string>} PAIRS_AR Normalized pairs as an array */
consts.PAIRS_AR = Object.keys(consts.Pairs).map((pair) => consts.Pairs[pair]);
