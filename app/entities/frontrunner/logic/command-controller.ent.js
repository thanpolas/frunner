/**
 * @fileoverview Handles live commands from bot.
 */

const config = require('config');
const { tokenAuto } = require('@thanpolas/crypto-utils');

const { isStarted, init, dispose } = require('./heartbeat.ent');
const { getBalances, SYNTH_DECIMALS } = require('../../synthetix');

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
