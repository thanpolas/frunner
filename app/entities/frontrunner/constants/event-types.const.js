/**
 * @fileoverview Available event types for frontrunner entity.
 */

const consts = (module.exports = {});

/**
 * @enum {string} Available event types for frontrunner entity.
 */
consts.eventTypes = {
  // A new price feed from DEXes and CEXis is available.
  PRICE_FEED: 'priceFeed',

  // A new block was mined.
  NEW_BLOCK: 'newBlock',
};
