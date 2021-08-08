/**
 * @fileoverview Query a price from link oracles.
 */

const { ethers } = require('ethers');

const { getProvider, network } = require('../../ether');
const { asyncMapCap } = require('../../../utils/helpers');

const ABI_AGGREGATOR = require('../abi/chain-aggregator.abi.json');
const { ETH_ORACLES_AR } = require('../constants/oracles.const');

const entity = (module.exports = {});

/** @const {number} EXP_DECIMALS Exponent of decimals for calculations */
const EXP_DECIMALS = 1e8;

/**
 * Fetches all oracle prices.
 *
 * @return {Promise<Object>} The response.
 */
entity.getAllPricesChainlink = async () => {
  const provider = getProvider(network.optimistic_kovan);

  const rawResults = await asyncMapCap(ETH_ORACLES_AR, async (oracle) => {
    const result = await entity.queryPrice(oracle.address, provider);
    return {
      result,
      decimals: oracle.decimals,
      name: oracle.name,
    };
  });

  const results = entity._processResults(rawResults);
  return results;
};

/**
 * Will query the Chainlink oracle for the price.
 *
 * @param {string} oracleAddress The address of the oracle.
 * @param {Object} provider Provider to use.
 * @return {Promise<Object>} A Promise with the results.
 */
entity.queryPrice = async (oracleAddress, provider) => {
  const priceFeedContract = new ethers.Contract(
    oracleAddress,
    ABI_AGGREGATOR,
    provider,
  );

  const price = await priceFeedContract.latestRoundData();

  return price;

  // BigNumber { _hex: '0x404f3d7e2c', _isBigNumber: true },
  // BigNumber { _hex: '0x610c0a90', _isBigNumber: true },
  // BigNumber { _hex: '0x610c0a90', _isBigNumber: true },
  // BigNumber { _hex: '0x020000000000002211', _isBigNumber: true },
  // roundId: BigNumber { _hex: '0x020000000000002211', _isBigNumber: true },
  // answer: BigNumber { _hex: '0x404f3d7e2c', _isBigNumber: true },
  // startedAt: BigNumber { _hex: '0x610c0a90', _isBigNumber: true },
  // updatedAt: BigNumber { _hex: '0x610c0a90', _isBigNumber: true },
  // answeredInRound: BigNumber { _hex: '0x020000000000002211', _isBigNumber: true }
};

/**
 * Process and normalize the results.
 *
 * @param {Array<Object>} rawResults Raw results from the oracle contract.
 * @return {Object<string>} Normalized object with pairs as keys and prices as
 *   values.
 */
entity._processResults = (rawResults) => {
  const res = rawResults.map((rawRes) => {
    const priceRaw = Number(rawRes.result.answer);
    rawRes.price = priceRaw / EXP_DECIMALS;
    return rawRes;
  });
  return res;
};
