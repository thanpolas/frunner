/**
 * @fileoverview Entity responsible for formatting and relaying select log
 *   messages to the admin channel.
 */

const config = require('config');

const { LogEvents } = require('../../events');
const { isConnected } = require('../../../services/discord.service');
const globals = require('../../../utils/globals');
const { getGuildChannel } = require('./guild.ent');
const { divergenceHr, getDivergence } = require('../../../utils/helpers');

const { DECISION_ENDED, ROAM_TRADE_EVENT_HANDLED } = LogEvents;

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
 * @return {string|void} The message.
 * @private
 */
entity._formatMessage = (lc) => {
  if (lc.event.error) {
    return entity._formatError(lc);
  }

  switch (lc.relay) {
    case DECISION_ENDED:
      return entity._formatDecisionEnded(lc);
    case ROAM_TRADE_EVENT_HANDLED:
      return entity._formatRoamTrade(lc);
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
 * @return {string|void} If trade closed return formatted message or void.
 * @private
 */
entity._formatDecisionEnded = (lc) => {
  if (lc.context?.closedTrade?.raw) {
    return entity._formatTradesClosed(lc);
  }
};

/**
 * Format the close trade event.
 *
 * @param {Object} lc Logality log context object.
 * @return {string} Formatted close trade message.
 * @private
 */
entity._formatTradesClosed = (lc) => {
  const { raw: trade } = lc.context.closedTrade;

  const initCap = Number(config.app.initial_capital);
  const currentCap = Number(trade.closed_dst_tokens);

  const capDivergence = divergenceHr(getDivergence(initCap, currentCap));

  const parts = ['Closed Trade'];

  parts.push(`**Network**: ${trade.network}`);
  parts.push(`**Testing**: ${trade.testing}`);
  parts.push(`**Cut Loss**: ${trade.closed_cut_losses}`);
  parts.push(`**Current sUSD Cap**: ${trade.closed_dst_tokens}`);
  parts.push(`**Original sUSD Cap & %**: ${initCap} (${capDivergence})`);
  parts.push(`**Synth**: ${trade.traded_dst_token_symbol}`);
  parts.push(`**Profit/loss**: ${trade.closed_profit_loss.toFixed(4)}`);
  parts.push(
    `**Open/Close Percent**: ${trade.traded_projected_percent_hr}/` +
      `${trade.closed_profit_loss_percent_hr}`,
  );

  parts.push(
    `**Open/Close Feed Price**: ${trade.traded_feed_price}/${trade.closed_feed_price}`,
  );
  parts.push(
    `**Open/Close Oracle Price**: ${trade.traded_oracle_price}/${trade.closed_oracle_price}`,
  );

  const message = parts.join(' - ');
  return message;
};

/**
 * Format the roam trade event.
 *
 * @param {Object} lc Logality log context object.
 * @return {string} Formatted close trade message.
 * @private
 */
entity._formatRoamTrade = (lc) => {
  const { raw: trade } = lc.context.closedTrade;

  const initCap = Number(config.app.initial_capital);

  const capDivergence = divergenceHr(
    getDivergence(initCap, trade.closed_target_usd_value),
  );

  const createDt = new Date(trade.created_at);
  const tradeDt = new Date(trade.traded_at);
  const closeDt = new Date(trade.closed_at);
  const elapsedTimeTrade = (tradeDt - createDt) / 1000;
  const elapsedTimeClose = (closeDt - tradeDt) / 1000;

  const parts = ['--==Closed Roam Trade==--'];

  parts.push(`**Network**: ${trade.network} **Testing**: ${trade.testing}`);
  parts.push(
    `**Traded**: ${trade.traded_source_tokens}${trade.opportunity_source_symbol}` +
      ` -> ${trade.traded_target_tokens}${trade.opportunity_target_symbol}`,
  );
  parts.push(
    `**Opportunity % (source - target = diff)**: ${trade.opportunity_source_usd_diff_percent_hr} -` +
      ` ${trade.opportunity_target_usd_diff_percent_hr} =` +
      ` ${trade.opportunity_source_target_diff_percent_hr}`,
  );
  parts.push(
    `**Close % Profit/Loss**: ${trade.closed_source_target_diff_percent_hr}`,
  );
  parts.push(
    `**Opportunity Feed Prices**: ${trade.opportunity_source_feed_price} - ${trade.opportunity_target_feed_price}`,
  );
  parts.push(
    `**Opportunity Oracle Prices**: ${trade.opportunity_source_oracle_price} - ${trade.opportunity_target_oracle_price}`,
  );
  parts.push(
    `**Close Oracle Prices**: ${trade.closed_source_oracle_price} - ${trade.closed_target_oracle_price}`,
  );
  parts.push(
    `**Close USD Value (source - target)**: $${trade.closed_source_usd_value} - $${trade.closed_target_usd_value}`,
  );
  parts.push(`**Close Profit/Loss**: $${trade.closed_profit_loss_usd}`);

  parts.push(`**Principal and %**: ${initCap} (${capDivergence})`);

  parts.push(
    `**Opportunity to Trade Elapsed Time (seconds)**: ${elapsedTimeTrade}"`,
  );
  parts.push(`**Trade to Close Elapsed Time (seconds)**: ${elapsedTimeClose}"`);

  const message = parts.join('\n');
  return message;
};
