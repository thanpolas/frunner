/**
 * @fileoverview Bootsrap for Entities.
 */

const discordEnt = require('./discord');
const messageRouter = require('./message-router');
const { init: initEther } = require('./ether');
const { init: initPriceFeeds } = require('./price-feeds');
const { init: initSnx } = require('./synthetix');

const bootstrap = (module.exports = {});

/**
 * Bootstrap for Entities.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise} a promise.
 */
bootstrap.init = async (bootOpts) => {
  if (bootOpts.testing) {
    return;
  }
  messageRouter.init();
  await discordEnt.init();
  await initEther();
  await initPriceFeeds();
  await initSnx();
};
