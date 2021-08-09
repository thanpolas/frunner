/**
 * @fileoverview Handle new block mined, fetches prices from oracles and synthetix.
 */

const entity = (module.exports = {});

/**
 * Handle new block mined, fetches prices from oracles and synthetix.
 *
 * @param {string} blockNumber The number of the block that was mined.
 * @return {Promise<void>} An empty Promise.
 */
entity.handleNewBlock = async (blockNumber) => {
  console.log(blockNumber);
};
