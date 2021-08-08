/**
 * @fileoverview Frontrunner core functionality.
 */

const { PRICE_FEED_PROCESSED } =
  require('../constants/event-types.const').eventTypes;
const { getEvents } = require('./heartbeat.ent');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/**
 * Initialize the heartbeat functionality.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  const events = getEvents();
  events.on(PRICE_FEED_PROCESSED, entity._onPriceFeedProcessed);
};

/**
 * Handle price feed processed event, check for trading opportunity.
 *
 * @param {Object<string>} prices The processed prices.
 * @param {number} heartbeat Heartbeat number.
 * @private
 */
entity._onPriceFeedProcessed = async (prices, heartbeat) => {
  await log.info('Received processed prices.', {
    custom: {
      prices,
      heartbeat,
    },
  });
};
