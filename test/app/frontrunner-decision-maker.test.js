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
} = require('../../app/entities/frontrunner/logic/decision-maker.ent');

describe('Frontrunner - Decision Making', () => {
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

      expect(result).toContainAllKeys(['openedTrades', 'closedTrades']);
      expect(result.openedTrades).toHaveLength(0);
      expect(result.closedTrades).toHaveLength(0);
    });
    test('Testing with wrong open trade figures, should not open a trade', async () => {
      const divergencies = divergenceStandard();
      divergencies.state.oraclePrices.BTCUSD =
        divergencies.state.synthPrices.BTCUSD = 46250.2;
      divergencies.state.feedPrices.BTCUSD = 46109.914;
      divergencies.oracleToFeed.BTCUSD = -0.0030424404;

      const result = await determineAction(divergencies);

      expect(result).toContainAllKeys(['openedTrades', 'closedTrades']);
      expect(result.openedTrades).toHaveLength(0);
      expect(result.closedTrades).toHaveLength(0);
    });
    test('Will create a new trade with a 3% profit', async () => {
      const divergences = divergenceOneOpportunity();
      const result = await determineAction(divergences);

      expect(result.openedTrades).toHaveLength(1);
      expect(result.closedTrades).toHaveLength(0);

      const [openTrade] = result.openedTrades;
      tradesAssert(openTrade, 'BTCUSD', divergences);
    });
    test('Will create two new trades', async () => {
      const divergences = divergenceTwoOpportunities();
      const result = await determineAction(divergences);

      expect(result.openedTrades).toHaveLength(2);
      expect(result.closedTrades).toHaveLength(0);

      const [openTrade1, openTrade2] = result.openedTrades;
      tradesAssert(openTrade1, 'BTCUSD', divergences);
      tradesAssert(openTrade2, 'LINKUSD', divergences);
    });
    test('Will create a new trade and close it', async () => {
      const divergencesOpen = divergenceOneOpportunity();
      const result = await determineAction(divergencesOpen);

      expect(result.openedTrades).toHaveLength(1);
      expect(result.closedTrades).toHaveLength(0);

      const divergencesClose = divergenceOneOpportunity();

      divergencesClose.state.heartbeat = 7;
      divergencesClose.state.blockNumber = 1054367;
      divergencesClose.state.oraclePrices.BTCUSD = 47356.1;
      divergencesClose.state.synthPrices.BTCUSD = 47356.1;
      divergencesClose.oracleToFeed.BTCUSD = 0;

      const resultClose = await determineAction(divergencesClose);

      expect(resultClose.openedTrades).toHaveLength(0);
      expect(resultClose.closedTrades).toHaveLength(1);

      const [closedTrade] = resultClose.closedTrades;

      expect(closedTrade.closed_profit_loss_percent).toEqual('3.00%');
      expect(closedTrade.closed_price_diff).toEqual(1379.3);
      expect(Number(closedTrade.closed_profit_loss).toFixed(2)).toEqual(
        '300.00',
      );
      tradesAssert(closedTrade, 'BTCUSD', divergencesOpen, divergencesClose);
    });
  });
});
