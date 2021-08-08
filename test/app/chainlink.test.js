/**
 * @fileoverview Test chainlink oracles price fetching.
 */

const testLib = require('../lib/test.lib');

// eslint-disable-next-line import/order
const config = require('config');

const { assert: pricesAssert } = require('../assert/prices.assert');

const { getAllPricesChainlink } = require('../../app/entities/chainlink');

describe('Fetch Prices from Chainlink Oracles', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    beforeEach(() => {
      // give an adequate timeout
      config.app.fetch_price_timeout = 3000;
    });
    test('Will successfully fetch all expected prices', async () => {
      const prices = await getAllPricesChainlink();
      console.log('prices:', prices);
      pricesAssert(prices);
    });
  });
  describe(`Error Cases`, () => {
    beforeEach(() => {
      // give an adequate timeout
      config.app.fetch_price_timeout = 3000;
    });
    test('Will handle timeout gracefully', async () => {
      // set timeout to 1ms so the request times out.
      config.app.fetch_price_timeout = 1;
      const prices = await getAllPricesChainlink();
      expect(prices).toBeUndefined();
    });
  });
});
