/**
 * @fileoverview Price feed sources.
 */

const consts = (module.exports = {});

/** @enum {string} Price feed sources */
consts.Sources = {
  COINBASE: 'coinbase',
  KRAKEN: 'kraken',
  BITFINEX: 'bitfinex',
};

/** @const {Array<string>} SOURCES_AR Price feed sources as an array */
consts.SOURCES_AR = Object.keys(consts.Sources).map(
  (key) => consts.Sources[key],
);
