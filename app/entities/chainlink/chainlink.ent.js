/**
 * @fileoverview Chainlink related functionality and logic.
 */

const {
  queryPrice,
  getAllPricesChainlink,
} = require('./logic/link-query-price.ent');

const { ETH_ORACLES } = require('./constants/oracles.const');

const entity = (module.exports = {});

entity.queryPrice = queryPrice;
entity.getAllPricesChainlink = getAllPricesChainlink;
entity.ETH_ORACLES = ETH_ORACLES;
