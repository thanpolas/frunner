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
 */
bootstrap.init = async () => {
  messageRouter.init();
  await discordEnt.init();
  await initEther();
  await initPriceFeeds();
  await initSnx();
};
