/**
 * @fileoverview Test frontrunner decision making.
 */

const testLib = require('../lib/test.lib');

const {
  divergenceStandard,
  // divergenceOneOpportunity,
  // divergenceTwoOpportunities,
} = require('../fixtures/divergences.fix');

const { determineAction } = require('../../app/entities/frontrunner');

describe('Frontrunner - Decision Making', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    test('Will complete an decision making without any new opportunities', async () => {
      const result = await determineAction(divergenceStandard);

      expect(result).toContainAllKeys(['openedTrades', 'closedTrades']);
      expect(result.openedTrades).toHaveLength(0);
      expect(result.closedTrades).toHaveLength(0);
    });
  });
});
