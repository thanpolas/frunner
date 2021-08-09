/**
 * @fileoverview Test new block handler entity.
 */

const testLib = require('../lib/test.lib');

const { handleNewBlock } = require('../../app/entities/frontrunner');
const { assert: pricesAssert } = require('../assert/prices.assert');

/** @const {number} BLOCK_NUM A valid blocknumber of OP Kovan */
const BLOCK_NUM = 1053393;

describe('Frontrunner - Handle new block entity', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    test('Will fetch oracle and synth prices and emit an event', async () => {
      const emitStub = jest.fn();
      const events = {
        emit: emitStub,
      };

      await handleNewBlock(events, BLOCK_NUM);

      expect(emitStub).toHaveBeenCalledTimes(1);

      // Only 1 argument
      expect(emitStub.mock.calls[0]).toHaveLength(2);

      const callArg0 = emitStub.mock.calls[0][0];
      const callArg1 = emitStub.mock.calls[0][1];

      // The event name
      expect(callArg0).toEqual('newBlock');

      expect(callArg1).toContainAllKeys([
        'synthPrices',
        'oraclePrices',
        'blockNumber',
      ]);

      expect(callArg1.blockNumber).toEqual(BLOCK_NUM);

      pricesAssert(callArg1.synthPrices);

      expect(callArg1.oraclePrices).toContainAllKeys([
        'oracleData',
        'oracleByPair',
      ]);
      pricesAssert(callArg1.oraclePrices.oracleByPair);
    });
  });
});
