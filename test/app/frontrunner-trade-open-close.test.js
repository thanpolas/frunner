/**
 * @fileoverview Test frontrunner decision making.
 */

const testLib = require('../lib/test.lib');
const { deleteAll } = require('../setup/trades.setup');
const { assert: tradesAssert } = require('../assert/trades.assert');

const {
  divergenceStandard,
  divergenceOneOpportunity,
  divergenceTwoOpportunities,
} = require('../fixtures/divergences.fix');

const { determineAction } = require('../../app/entities/frontrunner');
const {
  activeTrades,
} = require('../../app/entities/frontrunner/strategies/open-close');

describe('Frontrunner - trade open-close strat', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    async function tearDown() {
      await deleteAll();

      // empty local state
      const pairs = Object.keys(activeTrades);
      pairs.forEach((pair) => delete activeTrades[pair]);
    }
    beforeEach(tearDown);
    afterEach(tearDown);

    test('local activeTrades state should be empty', () => {
      expect(activeTrades).toContainAllKeys([]);
    });
    test('Will complete a decision without any new opportunities', async () => {
      const result = await determineAction(divergenceStandard());

      expect(result).toContainAllKeys(['openedTrade', 'closedTrade']);
      expect(result.openedTrade).toBeUndefined();
      expect(result.closedTrade).toBeUndefined();
    });
    test('Testing with wrong open trade figures, should not open a trade', async () => {
      const divergencies = divergenceStandard();
      divergencies.state.oraclePrices.BTCUSD =
        divergencies.state.synthPrices.BTCUSD = 46250.2;
      divergencies.state.feedPrices.BTCUSD = 46109.914;
      divergencies.oracleToFeed.BTCUSD = -0.0030424404;

      const result = await determineAction(divergencies);

      expect(result).toContainAllKeys(['openedTrade', 'closedTrade']);
      expect(result.openedTrade).toBeUndefined();
      expect(result.closedTrade).toBeUndefined();
    });
    test('Will create a new trade with a 3% profit', async () => {
      const divergences = divergenceOneOpportunity();
      const result = await determineAction(divergences);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrade).toBeUndefined();

      const { openedTrade } = result;
      tradesAssert(openedTrade, 'BTCUSD', divergences);
    });
    test('Will create one new trade out of two opportunities', async () => {
      const divergences = divergenceTwoOpportunities();
      const result = await determineAction(divergences);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrade).toBeUndefined();

      const { openedTrade } = result;
      tradesAssert(openedTrade, 'BTCUSD', divergences);
    });
    test('Will create a new trade and close it', async () => {
      const divergencesOpen = divergenceOneOpportunity();
      const result = await determineAction(divergencesOpen);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrad).toBeUndefined();

      const divergencesClose = divergenceOneOpportunity();

      divergencesClose.state.heartbeat = 7;
      divergencesClose.state.blockNumber = 1054367;
      divergencesClose.state.oraclePrices.BTCUSD = 47356.1;
      divergencesClose.state.synthPrices.BTCUSD = 47356.1;
      divergencesClose.oracleToFeed.BTCUSD = 0;

      const resultClose = await determineAction(divergencesClose);

      expect(resultClose.openedTrade).toBeUndefined();
      expect(resultClose.closedTrade).toBeObject();

      const { closedTrade } = resultClose;

      expect(closedTrade.closed_profit_loss_percent_hr).toEqual('3.00%');
      expect(closedTrade.closed_price_diff).toEqual(1379.3);
      expect(Number(closedTrade.closed_profit_loss).toFixed(2)).toEqual(
        '300.00',
      );
      tradesAssert(closedTrade, 'BTCUSD', divergencesOpen, divergencesClose);
    });
  });
});
