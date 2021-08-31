/**
 * @fileoverview Bootsrap for Entities.
 */

// Require Events first so it initializes.
require('./events');

const discordEnt = require('./discord');
// const messageRouter = require('./message-router');
const { init: initEther } = require('./ether');
const { init: initPriceFeeds } = require('./price-feeds');
const { init: initSnx } = require('./synthetix');
const {
  init: initFrontrunner,
  dispose: disposeFrontrunner,
} = require('./frontrunner');
const log = require('../services/log.service').get();

const bootstrap = (module.exports = {});

/**
 * Bootstrap for Entities.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise} a promise.
 */
bootstrap.init = async (bootOpts) => {
  await log.notice('Starting entities boot...');

  await initEther(bootOpts);
  await initSnx(bootOpts);
  await initFrontrunner(bootOpts);
  if (bootOpts.testing) {
    return;
  }

  // messageRouter.init(bootOpts);
  await discordEnt.init(bootOpts);
  await initPriceFeeds(bootOpts);

  await log.notice('Entities boot finished');
};

/**
 * Graceful shutdown functionality.
 *
 */
bootstrap.dispose = () => {
  disposeFrontrunner();
};
