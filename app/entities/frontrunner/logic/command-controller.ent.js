/**
 * @fileoverview Handles live commands from bot.
 */

const config = require('config');
const { tokenAuto } = require('@thanpolas/crypto-utils');

const { PAIRS_AR } = require('../../price-feeds');
const { isStarted, init, dispose } = require('./heartbeat.ent');
const {
  getBalances,
  getCurrentTokenSymbol,
  SYNTH_DECIMALS,
} = require('../../synthetix');
const { getDivergence, divergenceHr } = require('../../../utils/helpers');
const { localState } = require('./events-plexer.ent');

const entity = (module.exports = {});

/**
 * Start trading if stopped.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.startTrade = async (message) => {
  if (isStarted()) {
    await message.reply('Trading service already started, not doing anything.');
    return;
  }

  await init();
  await message.reply('Trading service started.');
};

/**
 * Stop trading if started.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.stopTrade = async (message) => {
  if (!isStarted()) {
    await message.reply('Trading service already stopped, not doing anything.');
    return;
  }

  dispose();
  await message.reply('Trading service stopped.');
};

/**
 * Will toggle testing mode
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.testToggle = async (message) => {
  if (config.app.testing) {
    config.app.testing = false;
  } else {
    config.app.testing = true;
  }

  await message.reply(`Set testing to: ${config.app.testing}`);
};

/**
 * Will set the divergence threshold.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.setThreshold = async (message) => {
  const [, threshold] = message.content.split(' ');
  const percentDivergence = Number.parseFloat(threshold);
  const decimalDivergence = percentDivergence / 100;
  config.app.divergence_threshold = decimalDivergence;
  await message.reply(
    `Set divergence threshold to ${percentDivergence}% (${decimalDivergence})`,
  );
};

/**
 * Get the current balances.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.getBalance = async (message) => {
  const balances = await getBalances();
  const symbols = Object.keys(balances);
  const balancesReadable = symbols.map((symbol) => {
    const val = tokenAuto(balances[symbol], SYNTH_DECIMALS);
    return `${symbol}: ${val}`;
  });

  const response = balancesReadable.join('\n');
  await message.reply(response);
};

/**
 * Start oracle tracking.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.startOracleTrack = async (message) => {
  localState._tempEnableBlockMonitor = true;
  await message.reply('Oracle tracking activated for BTCUSD.');
};

/**
 * Stop oracle tracking.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.stopOracleTrack = async (message) => {
  localState._tempEnableBlockMonitor = false;
  await message.reply('Oracle tracking stopped for BTCUSD.');
};

/**
 * Get current status of bot.
 *
 * @param {DiscordMessage} message The discord message.
 * @return {Promise<void>} A Promise.
 */
entity.status = async (message) => {
  function flatObj(obj) {
    return Object.keys(obj)
      .sort()
      .map((symbol) => `${symbol}:${Number.parseFloat(obj[symbol]).toFixed(3)}`)
      .join(' | ');
  }

  // Note: Oracle prices and synth prices are 100% the same, so only the
  //    oracle to feed divergence is calculated.
  const divergencies = [];
  PAIRS_AR.sort().forEach((pair) => {
    const divergence = divergenceHr(
      getDivergence(localState.oraclePrices[pair], localState.feedPrices[pair]),
    );
    divergencies.push(`${pair}:${divergence}`);
  });

  const msg = [];
  msg.push(`* **Testing**: ${config.app.testing}`);
  msg.push(`* **Network**: ${config.app.network}`);
  msg.push(`* **Feed heartbeat seconds**: ${config.app.heartbeat}`);
  msg.push(`* **Principal**: $${config.app.initial_capital}`);
  msg.push(`* **Trading Strategy**: ${config.app.trade_strategy}`);
  msg.push(
    `* **Divergence Threshold**: ${divergenceHr(
      config.app.divergence_threshold,
    )}`,
  );
  msg.push(`* **Heartbeat No**: ${localState.heartbeat}`);
  msg.push(`* **Block Number**: ${localState.blockNumber}`);
  msg.push(`* **Current Token**: ${getCurrentTokenSymbol()}`);
  msg.push(`* **Feed Prices**: ${flatObj(localState.feedPrices)}`);
  msg.push(`* **Oracle Prices**: ${flatObj(localState.oraclePrices)}`);
  msg.push(`* **Divergencies**: ${divergencies.join(' | ')}`);

  const megRendered = msg.join('\n');

  await message.reply(megRendered);
};
