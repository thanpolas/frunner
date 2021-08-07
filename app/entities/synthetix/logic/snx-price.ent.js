/**
 * @fileoverview Fetches prices of synths.
 */

const { getClient } = require('../synthetix.service');

const entity = (module.exports = {});

/**
 * Fetches prices for SNX synths.
 *
 * @return {Promise<void>} A Promise.
 */
entity.snxPrice = async () => {
  const snxjs = getClient();
  const { formatEther } = snxjs.utils;

  const blockOptions = {};

  const unformattedSnxPrice =
    await snxjs.contracts.ExchangeRates.rateForCurrency(
      snxjs.toBytes32('SNX'),
      blockOptions,
    ); // note blockOptions must be passed to `ethers.Contract` as the final parameter (and fails if no archive node)
  const snxPrice = formatEther(unformattedSnxPrice);

  return snxPrice;
};
