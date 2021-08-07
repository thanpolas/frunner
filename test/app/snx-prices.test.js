/**
 * @fileoverview Test SNX Prices functionality.
 */
const testLib = require('../lib/test.lib');
const { assert: pricesAssert } = require('../assert/prices.assert');

const { snxPrices } = require('../../app/entities/synthetix');

describe('Fetch Prices for synthetix synths', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    test('Will successfully fetch all synth prices', async () => {
      const prices = await snxPrices();
      pricesAssert(prices);
    });
  });
});
