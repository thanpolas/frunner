/**
 * @fileoverview Test frontrunner price feeds functionality.
 */
const testLib = require('../lib/test.lib');

// eslint-disable-next-line import/order
const config = require('config');

const {
  allPriceFeedRes,
  allPriceFeedResResults,
} = require('../fixtures/price-feeds.fix');

const { processPriceFeeds } = require('../../app/entities/frontrunner');

describe('Frontrunner price-feeds', () => {
  testLib.init();

  describe(`Happy processPriceFeeds()`, () => {
    beforeEach(() => {
      // give an adequate timeout
      config.app.fetch_price_timeout = 3000;
    });
    test('Will process the fetched feeds and produce mean values', () => {
      const prices = processPriceFeeds(allPriceFeedRes);

      expect(prices).toBeObject();
      expect(prices).toContainAllKeys([
        'BTCUSD',
        'ETHUSD',
        'LINKUSD',
        'UNIUSD',
        'AAVEUSD',
      ]);
      expect(prices.BTCUSD).toEqual(allPriceFeedResResults.BTCUSD);
      expect(prices.ETHUSD).toEqual(allPriceFeedResResults.ETHUSD);
      expect(prices.LINKUSD).toEqual(allPriceFeedResResults.LINKUSD);
      expect(prices.UNIUSD).toEqual(allPriceFeedResResults.UNIUSD);
      expect(prices.AAVEUSD).toEqual(allPriceFeedResResults.AAVEUSD);
    });
  });
});
