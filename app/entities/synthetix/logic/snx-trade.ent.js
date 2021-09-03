/**
 * @fileoverview Trades synths on synthetix.
 */

const { ethers } = require('ethers');
const { tokenToAuto } = require('@thanpolas/crypto-utils');

const { OP_KOVAN_PROXY } = require('../constants/proxy.const');
const snxAbi = require('../abi/synthetix.abi.json');
const { SynthAddresses, SYNTH_DECIMALS } = require('../constants/synths.const');
const { balances, getBalances } = require('./snx-balances.ent');

const { getSigner, network } = require('../../ether');
const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/** @type {Object?} Local cache of the signer instance */
entity._signer = null;

/** @type {string?} Local cache of the public address of the signer */
entity._ourAddr = null;

/** @type {Object?} Local cache of the contract to trade with */
entity._snxContract = null;

/**
 * Warm up the local caches.
 */
entity.init = async () => {
  await log.info('initializing SNX Trading module...');
  entity._signer = getSigner(network.optimistic_kovan);
  entity._ourAddr = await entity._signer.getAddress();
  entity._snxContract = new ethers.Contract(
    OP_KOVAN_PROXY,
    snxAbi,
    entity._signer,
  );
};

/**
 * Fetches prices for SNX synths.
 *
 * @param {SynthsSymbols} sourceSymbol Token to trade from.
 * @param {string} destinationSymbol Token to trade to.
 * @param {SynthsSymbols=} optSum How many tokens to exchange, by default will exchange
 *  all of them.
 * @return {Promise<Object>} A Promise with the completed transaction object.
 */
entity.snxTrade = async (sourceSymbol, destinationSymbol, optSum) => {
  await log.info(
    `SNX Trade requested from ${sourceSymbol} to ${destinationSymbol} for ${optSum}`,
  );
  const sourceToken = SynthAddresses[sourceSymbol];
  const destinationToken = SynthAddresses[destinationSymbol];
  const sourceAmount = optSum || balances[sourceSymbol];

  const tx = await entity._snxContract.exchange(
    sourceToken,
    sourceAmount,
    destinationToken,
  );

  const tx2 = await tx.wait();

  await getBalances();

  // Augment tx object with quantities traded
  tx2.sourceTokenSymbol = sourceSymbol;
  tx2.sourceTokenQuantity = sourceAmount;
  tx2.sourceTokenQuantityReadable = tokenToAuto(sourceAmount, SYNTH_DECIMALS);

  tx2.dstTokenSymbol = destinationSymbol;
  tx2.dstTokenQuantity = balances[destinationSymbol];
  tx2.dstTokenQuantityReadable = tokenToAuto(
    balances[destinationSymbol],
    SYNTH_DECIMALS,
  );

  return tx2;
};

//
// TX response of wait()
//

// to: '0x0064A673267696049938AA47595dD0B3C2e705A1',
// from: '0x56A36B81229f2e7559BDa672418a25B2Fd461C93',
// contractAddress: null,
// transactionIndex: 0,
// gasUsed: BigNumber { _hex: '0x558e26', _isBigNumber: true },
// logsBloom: '0x00010000000000000000000000000080000000000000000000040000000000000000000000000000802000100000000100000000000810000000000008000000080000000000000000000008000000000000000008000000040202400000000000000000060000000000000000000802000000000000020000000010000000000000002000000000000000000000000000000100002000000000000000000000000000000000000000000000000000000000000000000400000000000000000010000002000000000000000000000000000000000000000000880000000030000000000000000008020000400000000000000000000000000000000000000000',
// blockHash: '0xd4d5a6baa0064797f47935404aa6792db5d93b7aca0f20238f3b81ecb6f9a92e',
// transactionHash: '0xa5ccbec0530528dfd51248e8c9413314b159f5e7700bbe0c8e8110d16b4be233',
// logs: [
//   {
//     transactionIndex: 0,
//     blockNumber: 1090417,
//     transactionHash: '0xa5ccbec0530528dfd51248e8c9413314b159f5e7700bbe0c8e8110d16b4be233',
//     address: '0x4200000000000000000000000000000000000006',
//     topics: [Array],
//     data: '0x0000000000000000000000000000000000000000000000000000371f660334c0',
//     logIndex: 0,
//     blockHash: '0xd4d5a6baa0064797f47935404aa6792db5d93b7aca0f20238f3b81ecb6f9a92e'
//   },
// ]
