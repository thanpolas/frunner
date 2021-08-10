/**
 * @fileoverview Entity responsible for formatting and relaying select log
 *   messages to the admin channel.
 */

const config = require('config');
const { MessageEmbed } = require('discord.js');

const { LogEvents } = require('../../events');
const { isConnected } = require('../../../services/discord.service');
const globals = require('../../../utils/globals');
const { getGuildChannel } = require('./guild.ent');
const { divergenceHr, asyncMapCap } = require('../../../utils/helpers');

const { DECISION_ENDED, STAYING_COURSE, CUTTING_LOSSES } = LogEvents;

const entity = (module.exports = {});

/** @type {DiscordChannel?} Admin channel to send messages to */
entity._channel = null;

/**
 * Initialize the module by pre-fetching the admin channel to send logs to.
 *
 * @return {Promise<void>} An empty promise.
 */
entity.init = async () => {
  entity._channel = await getGuildChannel(config.discord.bot_log_channel_id);
};

/**
 * Middleware for logality, will relay select log messages to the admin channel.
 *
 * @param {Object} logContext Logality log context object.
 * @return {Promise<void>} A Promise.
 */
entity.loggerToAdmin = async (logContext) => {
  // Don't log when not connected to discord
  if (!isConnected()) {
    return;
  }

  // don't relay when testing
  if (globals.isTest) {
    return;
  }

  // only deal with logs to relay or errors.
  let message;
  if (logContext.relay || logContext.severity < 5) {
    message = entity._formatMessage(logContext);
  } else {
    return;
  }

  if (!message) {
    return;
  }

  return entity._channel.send(message);
};

/**
 * Format log message.
 *
 * @param {Object} lc Logality log context object.
 * @return {string|DiscordMessageEmbed} The message.
 * @private
 */
entity._formatMessage = (lc) => {
  if (lc.event.error) {
    return entity._formatError(lc);
  }

  switch (lc.relay) {
    case DECISION_ENDED:
      return entity._formatDecisionEnded(lc);
    case STAYING_COURSE:
      return entity._formatStayingCourse(lc);
    case CUTTING_LOSSES:
      return entity._formatCuttingLosses(lc);
    default:
      break;
  }

  return lc.message;
};

/**
 * Format an error log message.
 *
 * @param {Object} lc Logality log context object.
 * @return {string} The string message.
 * @private
 */
entity._formatError = (lc) => {
  const message = [];

  // suppress occassional 403 errors from RPC
  if (lc?.event?.error?.message?.includes('bad response (status=403')) {
    return;
  }
  message.push(`:octagonal_sign: [${lc.level}] ${lc.message} :: `);
  message.push(`${lc.event.error.name} :: ${lc.event.error.message} :: `);
  message.push(` :: ${lc.message}`);
  const messageStr = message.join('');
  return messageStr;
};

/**
 * Format decision ended log event.
 *
 * @param {Object} lc Logality log context object.
 * @return {Promise<void>} An empty promise, this is a special case that manages
 *    dispatching message to channel itself as it may produce multiple messages.
 * @private
 */
entity._formatDecisionEnded = async (lc) => {
  if (lc.context.openedTrades.raw.length) {
    await entity._formatTradesOpened(lc);
  }
  if (lc.context.closedTrades.raw.length) {
    await entity._formatTradesOpened(lc);
  }
};

/**
 * Format staying the course, log feed price evolution.
 *
 * @param {Object} lc Logality log context object.
 * @return {DiscordMessageEmbed} The string message.
 * @private
 */
entity._formatStayingCourse = (lc) => {
  const { pair } = lc.context;
  const embedMessage = new MessageEmbed()
    .setTitle(`Staying the course for open trade "${pair}"`)
    .setColor(config.discord.embed_color_staying);

  const { divergences } = lc.context;
  const { oracleToFeed } = divergences.raw;
  const divergence = oracleToFeed[pair];
  const { state: priceState } = divergences.raw;

  const { heartbeat, blockNumber } = priceState;
  const oracleValue = priceState.oraclePrices[pair];
  const synthValue = priceState.synthPrices[pair];
  const feedValue = priceState.feedPrices[pair];

  embedMessage
    .addField('Heartbeat - BlockNumber', `${heartbeat} - ${blockNumber}`, true)
    .addField('Oracle to Feed Divergence', divergenceHr(divergence))
    .addField('Oracle Price', oracleValue, true)
    .addField('Synth Price', synthValue, true)
    .addField('Feed Price', feedValue, true);

  return embedMessage;
};

/**
 * Format cutting losses.
 *
 * @param {Object} lc Logality log context object.
 * @return {DiscordMessageEmbed} The string message.
 * @private
 */
entity._formatCuttingLosses = (lc) => {
  const { pair } = lc.context;
  const embedMessage = new MessageEmbed()
    .setTitle(`Cutting losses on "${pair}"`)
    .setColor(config.discord.embed_color_loss);

  const { divergences } = lc.context;
  const { oracleToFeed } = divergences.raw;
  const divergence = oracleToFeed[pair];
  const { state: priceState } = divergences.raw;

  const { heartbeat, blockNumber } = priceState;
  const oracleValue = priceState.oraclePrices[pair];
  const synthValue = priceState.synthPrices[pair];
  const feedValue = priceState.feedPrices[pair];

  embedMessage
    .addField('Heartbeat - BlockNumber', `${heartbeat} - ${blockNumber}`, true)
    .addField('Oracle to Feed Divergence', divergenceHr(divergence))
    .addField('Oracle Price', oracleValue, true)
    .addField('Synth Price', synthValue, true)
    .addField('Feed Price', feedValue, true);

  return embedMessage;
};

/**
 * Format an error log message.
 *
 * @param {Object} lc Logality log context object.
 * @return {DiscordMessageEmbed} The string message.
 * @private
 */
entity._formatTradesOpened = async (lc) => {
  const { raw: openedTrades } = lc.context.openedTrades;

  await asyncMapCap(openedTrades, async (openedTrade) => {
    const {
      pair,
      network,
      traded_feed_price,
      traded_oracle_price,
      traded_projected_percent,
      traded_tx,
      traded_tokens_total,
      traded_token_symbol,
      traded_block_number: blockNumber,
      testing,
    } = openedTrade;

    const embedMessage = new MessageEmbed()
      .setTitle(`Opened new trade on "${pair}"`)
      .setColor(config.discord.embed_color_open);

    embedMessage
      .addField('BlockNumber', `${blockNumber}`, true)
      .addField('Oracle Price', `${traded_oracle_price}`, true)
      .addField(
        'Feed Price',
        `${traded_feed_price} (${traded_projected_percent})`,
        true,
      )
      .addField(
        'Tokens Traded',
        `${traded_tokens_total} ${traded_token_symbol}`,
      )
      .addField('TX', `${traded_tx}`, true)
      .setFooter(`Network: ${network} :: Testing: ${testing}`);

    return entity._channel.send(embedMessage);
  });
};

/**
 * Format an error log message.
 *
 * @param {Object} lc Logality log context object.
 * @return {DiscordMessageEmbed} The string message.
 * @private
 */
entity._formatTradesClosed = async (lc) => {
  const { raw: closedTrades } = lc.context.closedTrades;

  await asyncMapCap(closedTrades, async (closedTrade) => {
    const {
      pair,
      network,
      traded_feed_price,
      traded_oracle_price,
      traded_tokens_total,
      traded_projected_percent,
      traded_token_symbol,
      traded_block_number: blockNumber,
      closed_block_number: blockNumberClosed,
      closed_oracle_price,
      closed_feed_price,
      closed_tx,
      closed_profit_loss_money,
      closed_profit_loss_percent,
      testing,
    } = closedTrade;

    const embedMessage = new MessageEmbed()
      .setTitle(`Closed trade on "${pair}"`)
      .setColor(config.discord.embed_color_open);

    embedMessage
      .addField(
        'Open / Close BlockNumber',
        `${blockNumber} / ${blockNumberClosed}`,
        true,
      )
      .addField(
        'Open / Close Oracle Price',
        `${traded_oracle_price} / ${closed_oracle_price}`,
        true,
      )
      .addField(
        'Open / Close Feed Price',
        `${traded_feed_price} / ${closed_feed_price}`,
        true,
      )
      .addField(
        'Tokens Traded',
        `${traded_tokens_total} ${traded_token_symbol}`,
      )
      .addField('Close TX', `${closed_tx}`, true)
      .addField(
        'Profit / Loss',
        `${closed_profit_loss_money} ${traded_token_symbol} (${closed_profit_loss_percent})`,
        true,
      )
      .addField('Projected Profit %', `${traded_projected_percent}`, true)
      .setFooter(`Network: ${network} :: Testing: ${testing}`);

    return entity._channel.send(embedMessage);
  });
};
