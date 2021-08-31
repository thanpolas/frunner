/**
 * @fileoverview Test SNX trading functionality.
 */

const testLib = require('../lib/test.lib');

const { snxTrade } = require('../../app/entities/synthetix');
const snxTradeEnt = require('../../app/entities/synthetix/logic/snx-trade.ent');
const { getContractMock } = require('../mocks/contract.mock');

describe('SNX Trade', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    test('Will successfully make a trade', async () => {
      const contractMock = getContractMock();

      snxTradeEnt._snxContract = contractMock.contractInstance;

      await snxTrade('sUSD', 'sETH', 1);
      expect(contractMock.exchange).toHaveBeenCalledTimes(1);
    });
  });
});
