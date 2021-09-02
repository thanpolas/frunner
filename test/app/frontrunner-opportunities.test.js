/**
 * @fileoverview Test frontrunner opportunities entity.
 */

const testLib = require('../lib/test.lib');

const { allOpportunities } = require('../fixtures/opportunities.fix');

const {
  _sortOpportunities,
} = require('../../app/entities/frontrunner/strategies/open-close/open-trade.ent');

describe('Frontrunner - Opportunities', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    test('Will sort opportunities correctly', () => {
      const opportunities = allOpportunities();
      expect(opportunities[0].pair).toEqual('ETHUSD');
      _sortOpportunities(opportunities);
      expect(opportunities[0].pair).toEqual('LINKUSD');
    });
  });
});
