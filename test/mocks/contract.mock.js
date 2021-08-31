/**
 * @fileoverview Mock ethers.js contracts.
 */

const { usd_to_eth_trade_fix } = require('../fixtures/snx-trade.fix');

const mock = (module.exports = {});

mock.getContractMock = () => {
  const balanceOf = jest.fn(() => Promise.resolve(0));
  const symbol = jest.fn(() => Promise.resolve('MOCK-sUSD'));
  const exchangeWait = jest.fn(() => Promise.resolve(usd_to_eth_trade_fix()));
  const exchange = jest.fn(() =>
    Promise.resolve({
      wait: exchangeWait,
    }),
  );

  const contractInstance = {
    exchange,
    balanceOf,
    symbol,
  };
  const contract = jest.fn(contractInstance);

  return {
    contract,
    contractInstance,
    exchange,
    exchangeWait,
    balanceOf,
    symbol,
  };
};
