/**
 * @fileoverview Test coinbase price fetching.
 */

const config = require('config');

const testLib = require('../lib/test.lib');

const { getAllPricesCoinbase } = require('../../app/entities/price-feeds');

describe('Coinbase Price', () => {
  testLib.init();
  describe('Happy Path', () => {
    beforeEach(() => {
      // give an adequate timeout
      config.app.fetch_price_timeout = 3000;
    });
    test('Will successfully fetch all expected prices', async () => {
      const prices = await getAllPricesCoinbase();
      console.log('prices', prices);
    });
  });
});
