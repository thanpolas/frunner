/**
 * @fileoverview Handle new block mined, fetches prices from oracles and synthetix.
 */

const { snxPrices } = require('../../synthetix');
const { getAllPricesChainlink } = require('../../chainlink');
const { NEW_BLOCK } = require('../constants/event-types.const').eventTypes;

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/**
 * Handle new block mined, fetches prices from oracles and synthetix.
 *
 * @param {Event} events The event emitter instance.
 * @param {number} blockNumber The number of the block that was mined.
 * @return {Promise<void>} An empty Promise.
 */
entity.handleNewBlock = async (events, blockNumber) => {
  try {
    const [synthPrices, oraclePrices] = await Promise.all([
      snxPrices(),
      getAllPricesChainlink(),
    ]);

    const emitData = {
      synthPrices,
      oraclePrices,
      blockNumber,
    };

    events.emit(NEW_BLOCK, emitData);
  } catch (ex) {
    await log.error('handleNewBlock() :: Error', {
      error: ex,
      custom: {
        blockNumber,
      },
    });
  }
};
