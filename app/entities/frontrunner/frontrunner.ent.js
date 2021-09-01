/**
 * @fileoverview Frontrunner entity - core functionality.
 */

const {
  init: initHeartbeat,
  dispose: disposeHeartbeat,
} = require('./logic/heartbeat.ent');

const { init: initFrontrunnerCore } = require('./logic/events-plexer.ent');

const {
  fetchPriceFeeds,
  processPriceFeeds,
} = require('./logic/price-feeds.ent');
const { handleNewBlock } = require('./logic/handle-new-block.ent');
const {
  determineAction,
  init: initDecision,
} = require('./strategies/open-close');

const {
  startTrade,
  stopTrade,
  testToggle,
  setThreshold,
  getBalance,
  startOracleTrack,
  stopOracleTrack,
} = require('./logic/command-controller.ent');

const log = require('../../services/log.service').get();

const entity = (module.exports = {});

entity.fetchPriceFeeds = fetchPriceFeeds;
entity.processPriceFeeds = processPriceFeeds;
entity.handleNewBlock = handleNewBlock;
entity.determineAction = determineAction;
entity.startTrade = startTrade;
entity.stopTrade = stopTrade;
entity.testToggle = testToggle;
entity.setThreshold = setThreshold;
entity.getBalance = getBalance;
entity.startOracleTrack = startOracleTrack;
entity.stopOracleTrack = stopOracleTrack;

/**
 * Initialize frontrunner core functionality.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise<void>}
 */
entity.init = async (bootOpts) => {
  await log.info('Initializing Frontrunner...');
  await initHeartbeat(bootOpts);
  await initDecision();
  initFrontrunnerCore(bootOpts);
};

/**
 * Dispose of all the open handlers.
 *
 */
entity.dispose = () => {
  disposeHeartbeat();
};
