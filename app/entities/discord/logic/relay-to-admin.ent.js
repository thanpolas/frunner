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

    // Do not relay trade open messages
    if (message?.opened) {
      return;
    }

    // Transpose closed trade
    if (message?.closed) {
      message = message.closed;
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
 * @return {Object<DiscordMessageEmber>} An object with the created embed messages.
 * @private
 */
entity._formatDecisionEnded = (lc) => {
  const res = {
    opened: null,
    closed: null,
  };
  if (lc.context?.openedTrade?.raw) {
    res.opened = entity._formatTradesOpened(lc);
  }
  if (lc.context?.closedTrade?.raw) {
    res.closed = entity._formatTradesClosed(lc);
  }

  return res;
};

//
// A Trade Record
//
// id: '8ed52026-2654-48fd-b2a0-c4dc4a9cd133',
// pair: 'BTCUSD',
// opportunity_feed_price: 45163.8,
// opportunity_oracle_price: 45090.9,
// opportunity_block_number: 1091018,
// network: 'optimistic_kovan',
// traded: true,
// traded_feed_price: 45163.8,
// traded_oracle_price: 45090.9,
// traded_projected_percent: 0.00161688,
// traded_projected_percent_hr: '0.16%',
// traded_block_number: 1091018,
// traded_tx: '0x',
// traded_source_tokens: 10000,
// traded_source_token_symbol: 'sUSD',
// traded_dst_tokens: 1000,
// traded_dst_token_symbol: 'BTCUSD',
// traded_gas_spent: '0',
// closed_trade: true,
// closed_at: 2021-08-17T20:12:25.632Z,
// closed_tx: '0x',
// closed_price_diff: -0.01,
// closed_profit_loss: -0.00221774,
// closed_profit_loss_percent: -2.21774e-7,
// closed_profit_loss_percent_hr: '-0.00%',
// closed_feed_price: 45156.2,
// closed_oracle_price: 45090.9,
// closed_block_number: 1091019,
// testing: true,
// closed_cut_losses: false,
// closed_source_tokens: 1000,
// closed_source_token_symbol: 'BTCUSD',
// closed_dst_tokens: 10000,
// closed_dst_token_symbol: 'sUSD',
// closed_gas_spent: '0',
// created_at: 2021-08-17T20:11:54.767Z,
// updated_at: 2021-08-17T20:12:25.632Z
