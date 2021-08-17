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
const { divergenceHr } = require('../../../utils/helpers');

const { DECISION_ENDED, STAYING_COURSE, CUTTING_LOSSES, HEARTBEAT_UPDATE } =
  LogEvents;

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
  let message;
  try {
    // Don't log when not connected to discord
    if (!isConnected()) {
      return;
    }

    // don't relay when testing
    if (globals.isTest) {
      return;
    }

    if (!entity._channel) {
      return;
    }

    // only deal with logs to relay or errors.
    if (logContext.relay || logContext.severity < 5) {
      message = entity._formatMessage(logContext);
    } else {
      return;
    }

    if (!message) {
      return;
    }

    if (typeof message !== 'string') {
      if (Array.isArray(message)) {
        message = { embeds: message };
      } else {
        message = { embeds: [message] };
      }
    }
    await entity._channel.send(message);
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error('ERROR loggerToAdmin() ::', ex);
  }
};

/**
 * Format log message.
 *
 * @param {Object} lc Logality log context object.
 * @return {string|DiscordMessageEmbed|Array<DiscordMessageEmbed>} The message.
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
    case HEARTBEAT_UPDATE:
      return entity._formatHeartbeatUpdate(lc);
    default:
      break;
  }

  let message = '';
  if (lc.emoji) {
    message = `${lc.emoji} [${lc.level}] ${lc.message}`;
  } else {
    message = `:information_source: [${lc.level}] ${lc.message}`;
  }

  return message;
};

/**
 * Format an error log message.
 *
 * @param {Object} lc Logality log context object.
 * @return {string|void} The string message or empty for suppressed errors.
 * @private
 */
entity._formatError = (lc) => {
  const message = [];

  // suppress occassional 403 errors from RPC
  const errMsg = lc?.event?.error?.message;
  if (
    errMsg?.includes('bad response (status=403') ||
    errMsg?.includes('timeout of')
  ) {
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
 * @return {Array<DiscordMessageEmber>} An array with the created embed messages.
 * @private
 */
entity._formatDecisionEnded = (lc) => {
  let arOpened = [];
  let arClosed = [];
  if (lc.context.openedTrades.raw.length) {
    arOpened = entity._formatTradesOpened(lc);
  }
  if (lc.context.closedTrades.raw.length) {
    arClosed = entity._formatTradesClosed(lc);
  }

  return arOpened.concat(arClosed);
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

  const { raw: divergencies } = lc.context.divergencies;
  const { state: priceState, oracleToFeed } = divergencies;
  const divergence = oracleToFeed[pair];
  const { heartbeat, blockNumber } = priceState;

  const oracleValue = Number(priceState.oraclePrices[pair]).toFixed(2);
  const synthValue = Number(priceState.synthPrices[pair]).toFixed(2);
  const feedValue = Number(priceState.feedPrices[pair]).toFixed(2);

  embedMessage
    .addField('Oracle to Feed Divergence', divergenceHr(divergence))
    .addField('Oracle Price', oracleValue, true)
    .addField('Synth Price', synthValue, true)
    .addField('Feed Price', feedValue, true);

  entity._setFooter(embedMessage, heartbeat, blockNumber);

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

  const { raw: divergencies } = lc.context.divergencies;
  const { state: priceState, oracleToFeed } = divergencies;
  const { heartbeat, blockNumber } = priceState;
  const divergence = oracleToFeed[pair];

  const oracleValue = Number(priceState.oraclePrices[pair]).toFixed(2);
  const synthValue = Number(priceState.synthPrices[pair]).toFixed(2);
  const feedValue = Number(priceState.feedPrices[pair]).toFixed(2);

  embedMessage
    .addField('Oracle to Feed Divergence', divergenceHr(divergence))
    .addField('Oracle Price', oracleValue, true)
    .addField('Synth Price', synthValue, true)
    .addField('Feed Price', feedValue, true);

  entity._setFooter(embedMessage, heartbeat, blockNumber);

  return embedMessage;
};

/**
 * Format opened trades.
 *
 * @param {Object} lc Logality log context object.
 * @return {Array<DiscordMessageEmbed>} Embed messages.
 * @private
 */
entity._formatTradesOpened = (lc) => {
  const { raw: openedTrades } = lc.context.openedTrades;
  const { raw: divergencies } = lc.context.divergencies;
  const { state: priceState } = divergencies;
  const { heartbeat, blockNumber } = priceState;

  return openedTrades.map((openedTrade) => {
    const {
      pair,
      traded_feed_price,
      traded_oracle_price,
      traded_projected_percent,
      traded_tx,
      traded_tokens_total,
      traded_token_symbol,
      traded_block_number: tradedBlockNumber,
    } = openedTrade;

    const embedMessage = new MessageEmbed()
      .setTitle(`Opened new trade on "${pair}"`)
      .setColor(config.discord.embed_color_open);

    embedMessage
      .addField('Trade BlockNumber', `${tradedBlockNumber}`, true)
      .addField('Oracle Price', `${traded_oracle_price}`, true)
      .addField(
        'Feed Price',
        `${traded_feed_price} (+${divergenceHr(traded_projected_percent)})`,
        true,
      )
      .addField(
        'Tokens Traded',
        `${traded_tokens_total} ${traded_token_symbol}`,
      )
      .addField('TX', `${traded_tx}`, true);

    entity._setFooter(embedMessage, heartbeat, blockNumber);

    return embedMessage;
  });
};

/**
 * Format a trade close event.
 *
 * @param {Object} lc Logality log context object.
 * @return {Array<DiscordMessageEmbed>} Embed messages.
 * @private
 */
entity._formatTradesClosed = (lc) => {
  const { raw: closedTrades } = lc.context.closedTrades;
  const { raw: divergencies } = lc.context.divergencies;
  const { state: priceState } = divergencies;
  const { heartbeat, blockNumber } = priceState;

  return closedTrades.map((closedTrade) => {
    const {
      pair,
      traded_feed_price,
      traded_oracle_price,
      traded_tokens_total,
      traded_projected_percent,
      traded_token_symbol,
      traded_block_number: tradedBlockNumber,
      closed_block_number: blockNumberClosed,
      closed_oracle_price,
      closed_feed_price,
      closed_tx,
      closed_profit_loss,
      closed_profit_loss_percent,
    } = closedTrade;

    const embedMessage = new MessageEmbed()
      .setTitle(`Closed trade on "${pair}"`)
      .setColor(config.discord.embed_color_close);

    embedMessage
      .addField(
        'Open / Close BlockNumber',
        `${tradedBlockNumber} / ${blockNumberClosed}`,
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
        `${Number(closed_profit_loss).toFixed(
          2,
        )} ${traded_token_symbol} (${closed_profit_loss_percent})`,
        true,
      )
      .addField(
        'Projected Profit %',
        `${divergenceHr(traded_projected_percent)}`,
        true,
      );

    entity._setFooter(embedMessage, heartbeat, blockNumber);

    return embedMessage;
  });
};

/**
 * Format a heartbeat update.
 *
 * @param {Object} lc Logality log context object.
 * @return {DiscordMessageEmbed} The string message.
 * @private
 */
entity._formatHeartbeatUpdate = (lc) => {
  const embedMessage = new MessageEmbed()
    .setTitle(`Heartbeat Update - Prices`)
    .setColor(config.discord.embed_color_staying);

  const { divergencies: divergenciesRaw } = lc.context;
  const { raw: divergencies } = divergenciesRaw;

  const { state: priceState, oracleToFeed } = divergencies;
  const { heartbeat, blockNumber } = priceState;

  const samplePairs = ['BTCUSD', 'ETHUSD'];

  samplePairs.forEach((pair) => {
    const oracleValue = priceState.oraclePrices[pair];
    const synthValue = priceState.synthPrices[pair];
    const feedValue = priceState.feedPrices[pair];
    embedMessage
      .addField(`Oracle ${pair} Price`, `${oracleValue.toFixed(4)}`, true)
      .addField(`Synth ${pair} Price`, `${synthValue.toFixed(4)}`, true)
      .addField(`Feed ${pair} Price`, `${feedValue.toFixed(4)}`, true);
  });

  const allPairs = Object.keys(oracleToFeed);

  const embedMessageDiv = new MessageEmbed()
    .setTitle(`Heartbeat Update - Divergencies`)
    .setColor(config.discord.embed_color_staying);

  allPairs.forEach((pair) => {
    embedMessageDiv.addField(`${pair}`, divergenceHr(oracleToFeed[pair]), true);
  });

  entity._setFooter(embedMessageDiv, heartbeat, blockNumber);

  return [embedMessage, embedMessageDiv];
};

/**
 * Attach footer to the provided embed message.
 *
 * @param {DiscordMessageEmber} embedMessage The embed message to add footer to.
 * @param {number} heartbeat The current heartbeat.
 * @param {number} blockNumber The current blocknumber.
 * @private
 */
entity._setFooter = (embedMessage, heartbeat, blockNumber) => {
  embedMessage.setFooter(
    `Heartbeat: ${heartbeat} :: BlockNumber: ${blockNumber} ::` +
      ` Network: ${config.app.network} :: Testing: ${config.app.testing}`,
  );
};
