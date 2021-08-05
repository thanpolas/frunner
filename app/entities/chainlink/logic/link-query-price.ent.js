/**
 * @fileoverview Query a price from link oracles.
 */

const { ethers } = require('ethers');

const ABI_AGGREGATOR = require('../abi/chain-aggregator.abi.json');
const { getProvider } = require('../../ether');

const entity = (module.exports = {});

/**
 * Will query the Chainlink oracle for the price.
 *
 * @param {string} oracleAddress The address of the oracle.
 * @param {Object} network Local network object.
 * @return {Promise<>} A Promise.
 */
entity.queryPrice = async (oracleAddress, network) => {
  const provider = getProvider(network);

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
