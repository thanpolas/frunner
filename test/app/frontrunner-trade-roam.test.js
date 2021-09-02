/**
 * @fileoverview Test frontrunner roaming decision making.
 */

const testLib = require('../lib/test.lib');

// eslint-disable-next-line import/order
const config = require('config');

const { deleteAll } = require('../setup/trades-roam.setup');
const { assert: tradeRoamAssert } = require('../assert/trade-roam.assert');

const {
  divergenceRoamStandard,
  divergenceNegativeRoamStandard,
  divergenceOneRoamOpportunity,
  divergenceNegativeRoamOpportunity,
  divergenceTwoRoamOpportunities,
} = require('../fixtures/divergences.fix');

const { determineActionRoam } = require('../../app/entities/frontrunner');
const roamEventHandler = require('../../app/entities/frontrunner/strategies/roam/event-handler.ent');

describe('Frontrunner - Trade Roaming', () => {
  testLib.init();

  describe(`Happy Path`, () => {
    async function tearDown() {
      config.app.divergence_threshold = 0.003;
      await deleteAll();

      // empty local state
      roamEventHandler.activeOpportunity = null;
    }
    beforeEach(tearDown);
    afterEach(tearDown);

    test('local activeOpportunity state should be empty', () => {
      expect(roamEventHandler.activeOpportunity).toBeUndefined();
    });
    test('Will complete a decision without any new opportunities', async () => {
      const result = await determineActionRoam(divergenceRoamStandard());

      expect(result).toContainAllKeys(['openedTrade', 'closedTrade']);
      expect(result.openedTrade).toBeUndefined();
      expect(result.closedTrade).toBeUndefined();
    });
    test('Testing with negative divergence, should not open a trade', async () => {
      const divergencies = divergenceNegativeRoamStandard();

      const result = await determineActionRoam(divergencies);

      expect(result).toContainAllKeys(['openedTrade', 'closedTrade']);
      expect(result.openedTrade).toBeUndefined();
      expect(result.closedTrade).toBeUndefined();
    });
    test.only('Will create a new trade with a 3% profit', async () => {
      const divergences = divergenceOneRoamOpportunity();
      const result = await determineActionRoam(divergences);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrade).toBeUndefined();

      const { openedTrade } = result;

      console.log(openedTrade);
      tradeRoamAssert(openedTrade, divergences);
    });
    test('Will create a new trade from a very negative opportunity', async () => {
      const divergences = divergenceNegativeRoamOpportunity();
      const result = await determineActionRoam(divergences);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrade).toBeUndefined();

      const { openedTrade } = result;
      tradeRoamAssert(openedTrade, divergences);
    });

    test('Will create one new trade out of two opportunities', async () => {
      const divergences = divergenceTwoRoamOpportunities();
      const result = await determineActionRoam(divergences);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrade).toBeUndefined();

      const { openedTrade } = result;
      tradeRoamAssert(openedTrade, divergences);
    });
    test('Will create a new trade and close it', async () => {
      const divergencesOpen = divergenceOneRoamOpportunity();
      const result = await determineActionRoam(divergencesOpen);

      expect(result.openedTrade).toBeObject();
      expect(result.closedTrad).toBeUndefined();

      const divergencesClose = divergenceOneRoamOpportunity();

      divergencesClose.state.heartbeat = 7;
      divergencesClose.state.blockNumber = 1054367;
      divergencesClose.state.oraclePrices.BTCUSD = 47356.1;
      divergencesClose.state.synthPrices.BTCUSD = 47356.1;
      divergencesClose.oracleToFeed.BTCUSD = 0;

      const resultClose = await determineActionRoam(divergencesClose);

      expect(resultClose.openedTrade).toBeUndefined();
      expect(resultClose.closedTrade).toBeObject();

      const { closedTrade } = resultClose;

      expect(closedTrade.closed_profit_loss_percent_hr).toEqual('3.00%');
      expect(closedTrade.closed_price_diff).toEqual(1379.3);
      expect(Number(closedTrade.closed_profit_loss).toFixed(2)).toEqual(
        '300.00',
      );
      tradeRoamAssert(closedTrade, divergencesOpen, divergencesClose);
    });
  });
});
