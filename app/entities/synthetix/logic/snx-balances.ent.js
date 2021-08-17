/**
 * @fileoverview Get synths balances.
 */

const { ethers } = require('ethers');
const { tokenAuto } = require('@thanpolas/crypto-utils');

const { getSigner, network, erc20GenericAbi } = require('../../ether');
const {
  SynthERC20AddressesAr,
  SYNTH_DECIMALS,
} = require('../constants/synths.const');
const { asyncMapCap } = require('../../../utils/helpers');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/**
 * Local cache of balances.
 */
entity.balances = {};

/**
 * Initialize balances by warming up the local cache.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  const balances = await entity.getBalances();
  const tokens = Object.keys(balances);
  const balancesReadable = tokens.map((token) => {
    const val = tokenAuto(balances[token], SYNTH_DECIMALS);
    return `${token}: ${val}`;
  });

  await log.info(`Balances of synths: ${balancesReadable.join(' - ')}`);
};

/**
 * Fetches balances for all Synths.
 *
 * Function may be executed outside error catch so needs to catch own errors.
 *
 * @return {Promise<Object>} A Promise with the balances using the symbol as key.
 */
entity.getBalances = async () => {
  try {
    const signer = getSigner(network.optimistic_kovan);
    const ourAddr = await signer.getAddress();

    const balances = {};
    await asyncMapCap(
      SynthERC20AddressesAr,
      async (addr) => {
        const contract = new ethers.Contract(addr, erc20GenericAbi, signer);
        const balance = await contract.balanceOf(ourAddr);
        const symbol = await contract.symbol();
        entity.balances[symbol] = balances[symbol] = balance;
      },
      10,
    );

    return balances;
  } catch (ex) {
    await log.error('getBalances Error', {
      error: ex,
      relay: true,
    });
  }
};
