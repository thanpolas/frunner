/**
 * @fileoverview Test getAllPrices from all dexes or cexes available.
 */

const testLib = require('../lib/test.lib');

// eslint-disable-next-line import/order
const config = require('config');

const { assert: pricesAssert } = require('../assert/prices.assert');

const {
  getAllPricesCoinbase,
  getAllPriceBitfinex,
  getAllPricesKraken,
} = require('../../app/entities/price-feeds');

describe('Fetch Prices from DEXes and CEXes', () => {
  testLib.init();

  const allFetchPricesMethods = [
    ['getAllPricesCoinbase', getAllPricesCoinbase],
    ['getAllPriceBitfinex', getAllPriceBitfinex],
    ['getAllPricesKraken', getAllPricesKraken],
  ];

  allFetchPricesMethods.forEach(([fnName, allPrices]) => {
    describe(`Happy Path for ${fnName}`, () => {
      beforeEach(() => {
        // give an adequate timeout
        config.app.fetch_price_timeout = 3000;
      });
      test('Will successfully fetch all expected prices', async () => {
        const prices = await allPrices();
        pricesAssert(prices);
      });
    });
    describe(`Error Cases for ${fnName}`, () => {
      beforeEach(() => {
        // give an adequate timeout
        config.app.fetch_price_timeout = 3000;
      });
      test('Will handle timeout gracefully', async () => {
        // set timeout to 1ms so the request times out.
        config.app.fetch_price_timeout = 1;
        const prices = await allPrices();
        expect(prices).toBeUndefined();
      });
    });
  });
});
