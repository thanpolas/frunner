/**
 * @fileoverview Trades synths on synthetix.
 */

const { ethers } = require('ethers');

const { OP_KOVAN_PROXY } = require('../constants/proxy.const');
const snxAbi = require('../abi/synthetix.abi.json');
const { SynthAddresses } = require('../constants/synths.const');
const { balances, getBalances } = require('./snx-balances.ent');

const { getSigner, network } = require('../../ether');

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
  const sourceToken = SynthAddresses[sourceSymbol];
  const destinationToken = SynthAddresses[destinationSymbol];
  const sourceAmount = optSum || balances[sourceSymbol];

  const tx = await entity._snxContract.exchange(
    sourceToken,
    sourceAmount,
    destinationToken,
  );

  const tx2 = await tx.wait();

  // Launch getBalances in the background (do not await)
  getBalances();

  return tx2;
};
