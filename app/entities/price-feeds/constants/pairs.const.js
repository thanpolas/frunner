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

/** @enum {string} Matching pairs to synth symbols */
consts.PairsToSynths = {
  BTCUSD: 'sBTC',
  ETHUSD: 'sETH',
  LINKUSD: 'sLINK',
  UNIUSD: 'sUNI',
  AAVEUSD: 'sAAVE',
};

/** @enum {string} Synths symbols to Matching pairs */
consts.SynthsToPairs = {
  sBTC: 'BTCUSD',
  sETH: 'ETHUSD',
  sLINK: 'LINKUSD',
  sUNI: 'UNIUSD',
  sAAVE: 'AAVEUSD',
};

/** @const {Array<string>} PAIRS_AR Normalized pairs as an array */
consts.PAIRS_AR = Object.keys(consts.Pairs).map((pair) => consts.Pairs[pair]);
