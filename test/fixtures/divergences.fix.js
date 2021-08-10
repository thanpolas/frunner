/**
 * @fileoverview Divergences fixtures for testing decision making.
 */

const fix = (module.exports = {});

fix.divergenceStandard = () => {
  return {
    state: {
      heartbeat: 3,
      blockNumber: 1054363,
      feedPrices: {
        BTCUSD: 45894.60999999999,
        ETHUSD: 3154.31,
        LINKUSD: 24.512469999999997,
        UNIUSD: 28.393466666666665,
        AAVEUSD: 381.70866666666666,
      },
      oraclePrices: {
        AAVEUSD: 380.365,
        BTCUSD: 45976.82,
        ETHUSD: 3158.78,
        LINKUSD: 24.53238,
        UNIUSD: 28.409,
      },
      synthPrices: {
        BTCUSD: 45976.82,
        ETHUSD: 3158.78,
        LINKUSD: 24.53238,
        UNIUSD: 28.409,
        AAVEUSD: 380.365,
      },
    },
    oracleToFeed: {
      BTCUSD: 0.001791277886444842,
      ETHUSD: 0.001417108654507615,
      LINKUSD: 0.0008122396478202898,
      UNIUSD: 0.0005470742095599057,
      AAVEUSD: -0.0035201366487180863,
    },
  };
};

fix.divergenceOneOpportunity = () => {
  const divergenceOneOpportunity = fix.divergenceStandard();
  divergenceOneOpportunity.state.heartbeat = 5;
  divergenceOneOpportunity.state.blockNumber = 1054365;
  divergenceOneOpportunity.state.feedPrices.BTCUSD = 47356.1246;
  divergenceOneOpportunity.oracleToFeed.BTCUSD = 0.03;

  return divergenceOneOpportunity;
};

fix.divergenceTwoOpportunities = () => {
  const divergenceTwoOpportunities = fix.divergenceOneOpportunity();
  divergenceTwoOpportunities.state.heartbeat = 8;
  divergenceTwoOpportunities.state.blockNumber = 1054367;
  divergenceTwoOpportunities.state.feedPrices.LINKUSD = 25.2683514;
  divergenceTwoOpportunities.oracleToFeed.LINKUSD = 0.03;

  return divergenceTwoOpportunities;
};
