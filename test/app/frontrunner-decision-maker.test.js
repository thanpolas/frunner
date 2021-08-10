/**
 * @fileoverview Test frontrunner decision making.
 */

const testLib = require('../lib/test.lib');
const { deleteAll } = require('../setup/trades.setup');

const {
  divergenceStandard,
  // divergenceOneOpportunity,
  // divergenceTwoOpportunities,
} = require('../fixtures/divergences.fix');

const { determineAction } = require('../../app/entities/frontrunner');
const {
  activeTrades,
} = require('../../app/entities/frontrunner/logic/decision-maker.ent');

describe('Frontrunner - Decision Making', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    afterAll(async () => {
      await deleteAll();
    });
    test('local activeTrades state should be empty', () => {
      expect(activeTrades).toContainAllKeys([]);
    });
    test('Will complete a decision without any new opportunities', async () => {
      const result = await determineAction(divergenceStandard());

      expect(result).toContainAllKeys(['openedTrades', 'closedTrades']);
      expect(result.openedTrades).toHaveLength(0);
      expect(result.closedTrades).toHaveLength(0);
    });
  });
});
