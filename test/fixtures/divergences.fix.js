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
        BTCUSD: 45894.6,
        ETHUSD: 3154.3,
        LINKUSD: 24.51,
        UNIUSD: 28.39,
        AAVEUSD: 381.7,
      },
      oraclePrices: {
        AAVEUSD: 380.36,
        BTCUSD: 45976.8,
        ETHUSD: 3158.7,
        LINKUSD: 24.53,
        UNIUSD: 28.4,
      },
      synthPrices: {
        BTCUSD: 45976.8,
        ETHUSD: 3158.7,
        LINKUSD: 24.53,
        UNIUSD: 28.4,
        AAVEUSD: 380.36,
      },
    },
    oracleToFeed: {
      BTCUSD: -0.001791277886444842,
      ETHUSD: -0.001417108654507615,
      LINKUSD: -0.0008122396478202898,
      UNIUSD: -0.0005470742095599057,
      AAVEUSD: 0.0005201366487180863,
    },
    currentTokenSymbol: 'sUSD',
  };
};

fix.divergenceOneOpportunity = () => {
  const divergenceOneOpportunity = fix.divergenceStandard();
  divergenceOneOpportunity.state.heartbeat = 5;
  divergenceOneOpportunity.state.blockNumber = 1054365;
  divergenceOneOpportunity.state.feedPrices.BTCUSD = 47356.1;
  divergenceOneOpportunity.oracleToFeed.BTCUSD = 0.03;

  return divergenceOneOpportunity;
};

fix.divergenceTwoOpportunities = () => {
  const divergenceTwoOpportunities = fix.divergenceOneOpportunity();
  divergenceTwoOpportunities.state.heartbeat = 8;
  divergenceTwoOpportunities.state.blockNumber = 1054367;
  divergenceTwoOpportunities.state.feedPrices.LINKUSD = 25.26;
  divergenceTwoOpportunities.oracleToFeed.LINKUSD = 0.03;

  return divergenceTwoOpportunities;
};

fix.divergenceRoamStandard = () => {
  const divergenceRoamStandard = fix.divergenceStandard();
  divergenceRoamStandard.currentTokenSymbol = 'sUNI';

  return divergenceRoamStandard;
};

fix.divergenceOneRoamOpportunity = () => {
  const divergenceOneRoamOpportunity = fix.divergenceRoamStandard();
  divergenceOneRoamOpportunity.state.heartbeat = 8;
  divergenceOneRoamOpportunity.state.blockNumber = 1054367;
  divergenceOneRoamOpportunity.state.feedPrices.LINKUSD = 25.26;
  divergenceOneRoamOpportunity.oracleToFeed.LINKUSD = 0.03;
  divergenceOneRoamOpportunity.currentTokenSymbol = 'sUNI';

  return divergenceOneRoamOpportunity;
};

fix.divergenceNegativeRoamStandard = () => {
  const divergenceNegativeRoamStandard = fix.divergenceRoamStandard();
  divergenceNegativeRoamStandard.state.oraclePrices.BTCUSD =
    divergenceNegativeRoamStandard.state.synthPrices.BTCUSD = 46250.2;
  divergenceNegativeRoamStandard.state.feedPrices.BTCUSD = 46109.914;
  divergenceNegativeRoamStandard.oracleToFeed.BTCUSD = -0.0030424404;

  return divergenceNegativeRoamStandard;
};

fix.divergenceNegativeRoamOpportunity = () => {
  const divergenceNegativeRoamOpportunity = fix.divergenceRoamStandard();
  divergenceNegativeRoamOpportunity.state.heartbeat = 8;
  divergenceNegativeRoamOpportunity.state.blockNumber = 1054367;
  divergenceNegativeRoamOpportunity.state.feedPrices.UNIUSD = 27.5;
  divergenceNegativeRoamOpportunity.oracleToFeed.UNIUSD = -0.05;
  divergenceNegativeRoamOpportunity.currentTokenSymbol = 'sUNI';

  return divergenceNegativeRoamOpportunity;
};

fix.divergenceTwoRoamOpportunities = () => {
  const divergenceTwoRoamOpportunities = fix.divergenceTwoRoamOpportunities();
  divergenceTwoRoamOpportunities.state.heartbeat = 8;
  divergenceTwoRoamOpportunities.state.blockNumber = 1054367;
  divergenceTwoRoamOpportunities.state.feedPrices.BTCUSD = 47356.1;
  divergenceTwoRoamOpportunities.oracleToFeed.BTCUSD = 0.04;
  divergenceTwoRoamOpportunities.currentTokenSymbol = 'sUNI';

  return divergenceTwoRoamOpportunities;
};
