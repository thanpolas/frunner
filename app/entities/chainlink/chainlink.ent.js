/**
 * @fileoverview Chainlink related functionality and logic.
 */

const {
  queryPrice,
  getAllPricesChainlink,
} = require('./logic/link-query-price.ent');

const entity = (module.exports = {});

entity.queryPrice = queryPrice;
entity.getAllPricesChainlink = getAllPricesChainlink;
