/**
 * @fileoverview Will ensure there is approval to spend for all trading synths.
 */

const { ethers } = require('ethers');

const { getSigner, network, DEFAULT_GAS_BUFFER } = require('../../ether');
const { getClient } = require('../synthetix.service');
const { SynthsSdkAr } = require('../constants/synths.const');
const { BALANCER_LINKS } = require('../constants/proxy.const');
const { asyncMapCap } = require('../../../utils/helpers');

const log = require('../../../services/log.service').get();

const PROXY_ADDR = BALANCER_LINKS.kovan.proxyAddr;

const entity = (module.exports = {});

entity.init = async () => {
  await log.info('Approving all synths to synthetix for trading...');
  await entity.approveAllSynths();
  await log.info('All synths approved.');
};

/**
 * Give approval to SNX to spend for all trading synths.
 *
 * @return {Promise<void>} A Promise.
 */
entity.approveAllSynths = async () => {
  const snxjs = getClient();
  const signer = getSigner(network.optimistic_kovan);
  const { parseUnits } = snxjs.utils;
  const ourAddr = await signer.getAddress();

  await asyncMapCap(
    SynthsSdkAr,
    async (synth) => {
      const allowance = await snxjs.contracts[synth].allowance(
        ourAddr,
        PROXY_ADDR,
      );

      if (allowance.toString() !== '0') {
        // has allowance
        return;
      }

      const gasLimitEstimate = await snxjs.contracts[synth].estimateGas.approve(
        PROXY_ADDR,
        ethers.constants.MaxUint256,
      );

      const gasLimit = gasLimitEstimate.toNumber() + DEFAULT_GAS_BUFFER;

      try {
        const allowanceTx = await snxjs.contracts[synth].approve(
          PROXY_ADDR,
          ethers.constants.MaxUint256,
          {
            gasPrice: parseUnits('0.015', 'gwei'),
            gasLimit,
          },
        );

        await allowanceTx.wait();
      } catch (ex) {
        await log.error(`Approve failed for ${synth}`, { error: ex });
      }
    },
    1,
  );
};

// 'DECIMALS()': [FunctionFragment],
// 'FEE_ADDRESS()': [FunctionFragment],
// 'acceptOwnership()': [FunctionFragment],
// 'allowance(address,address)': [FunctionFragment],
// 'approve(address,uint256)': [FunctionFragment],
// 'balanceOf(address)': [FunctionFragment],
// 'burn(address,uint256)': [FunctionFragment],
// 'currencyKey()': [FunctionFragment],
// 'decimals()': [FunctionFragment],
// 'integrationProxy()': [FunctionFragment],
// 'isResolverCached()': [FunctionFragment],
// 'issue(address,uint256)': [FunctionFragment],
// 'messageSender()': [FunctionFragment],
// 'name()': [FunctionFragment],
// 'nominateNewOwner(address)': [FunctionFragment],
// 'nominatedOwner()': [FunctionFragment],
// 'owner()': [FunctionFragment],
// 'proxy()': [FunctionFragment],
// 'rebuildCache()': [FunctionFragment],
// 'resolver()': [FunctionFragment],
// 'resolverAddressesRequired()': [FunctionFragment],
// 'setIntegrationProxy(address)': [FunctionFragment],
// 'setMessageSender(address)': [FunctionFragment],
// 'setProxy(address)': [FunctionFragment],
// 'setTokenState(address)': [FunctionFragment],
// 'setTotalSupply(uint256)': [FunctionFragment],
// 'symbol()': [FunctionFragment],
// 'tokenState()': [FunctionFragment],
// 'totalSupply()': [FunctionFragment],
// 'transfer(address,uint256)': [FunctionFragment],
// 'transferAndSettle(address,uint256)': [FunctionFragment],
// 'transferFrom(address,address,uint256)': [FunctionFragment],
// 'transferFromAndSettle(address,address,uint256)': [FunctionFragment],
// 'transferableSynths(address)': [FunctionFragment]
