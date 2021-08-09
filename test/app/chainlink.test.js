/**
 * @fileoverview Test chainlink oracles price fetching.
 */

const testLib = require('../lib/test.lib');

const { assert: pricesAssert } = require('../assert/prices.assert');

const { getAllPricesChainlink } = require('../../app/entities/chainlink');

describe('Fetch Prices from Chainlink Oracles', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    test('Will successfully fetch all expected prices', async () => {
      const oraclePrices = await getAllPricesChainlink();
      expect(oraclePrices).toContainAllKeys(['oracleData', 'oracleByPair']);
      pricesAssert(oraclePrices.oracleByPair);
    });
  });
});
