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

  PRICE_FEED_PROCESSED: 'priceFeedProcessed',

  // A new block was mined.
  NEW_BLOCK: 'newBlock',

  // A bitfinex trade event occured.
  BITFINEX_TRADE: 'bitfinexTrade',
};
