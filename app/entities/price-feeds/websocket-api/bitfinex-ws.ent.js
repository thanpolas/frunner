/**
 * @fileoverview Bitfinex websockets integration.
 */

const WebSocket = require('ws');

const { events, eventTypes } = require('../../events');
const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

entity.BITFINEX_WS_ENDPOINT = 'wss://api-pub.bitfinex.com/ws/2';
entity.BITFINEX_PAIRS = [
  'tAAVE:USD',
  'tBTCUSD',
  'tETHUSD',
  'tLINK:USD',
  'tUNIUSD',
];
entity.BITFINEX_TO_PAIRS = {
  'tAAVE:USD': 'AAVEUSD',
  tBTCUSD: 'BTCUSD',
  tETHUSD: 'ETHUSD',
  'tLINK:USD': 'LINKUSD',
  tUNIUSD: 'UNIUSD',
};

/** @type {Object?} websocket client */
entity.ws = null;

/** @type {Object} Stores the subscribed channels */
entity._channels = {};

/**
 * Initialize the websocket client.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise<void>}
 */
entity.init = (bootOpts) => {
  if (bootOpts.testing) {
    return;
  }
  return new Promise((resolve) => {
    entity.ws = new WebSocket(entity.BITFINEX_WS_ENDPOINT);

    entity.ws.on('open', entity._onOpen.bind(null, resolve));

    entity.ws.on('close', async function close() {
      await log.info('Bitfinext websocket disconnected.');
    });

    entity.ws.on('error', async function error(er) {
      await log.warn('Bitfinext websocket error.', { error: er });
    });

    entity.ws.on('message', entity._handleIncoming);
  });
};

/**
 * Dispose the websocket client.
 */
entity.dispose = () => {
  if (!entity.ws) {
    return;
  }
  entity.ws.terminate();
};

/**
 * Will handle open event.
 *
 * @param {function} resolve Init function resolution.
 * @return {Promise<void>}
 * @private
 */
entity._onOpen = async (resolve) => {
  await log.info('Bitfinext websocket connected.');

  entity._subscribe();

  resolve();
};

/**
 * Websocket message handler.
 *
 * @param {Object} payload Websocket payload.
 * @return {Promise<void>} A Promise.
 * @private
 */
entity._handleIncoming = async (payload) => {
  try {
    // Types of messages:
    //
    // Channel subscription
    // {"event":"subscribed","channel":"ticker","chanId":70151,"symbol":"tBTCUSD","pair":"BTCUSD"}
    // {"event":"subscribed","channel":"trades","chanId":91,"symbol":"tBTCUSD","pair":"BTCUSD"}
    //
    // Channel broadcast (ticker)
    // [70151,[49387,8.41961476,49388,14.476154150000001,-855,-0.017,49389,4763.8858262,50365,48332]]
    //
    //  Channel broadcast (trades)
    // [91,"te",[814055101,1630651865424,-0.17982184,49453]]
    // [91,"tu",[814055099,1630651865423,-0.00016391,49453.36864597]]
    // [91,"tu",[814055101,1630651865424,-0.17982184,49453]]
    // [91,"tu",[814055097,1630651865423,-0.00017873,49455.12203753]]
    // [91,"te",[814055102,1630651866100,0.01091836,49456]]
    // [91,"te",[814055103,1630651866101,0.0202,49457]]
    //
    // heartbeat, ignore
    // [70151,"hb"]

    // Based on the above inputs, two kinds will only be processed:
    // subscriptions and trades broadcasts.
    const message = JSON.parse(payload.toString());
    if (Array.isArray(message)) {
      entity._handleTrade(message);
      return;
    }

    entity._handleSubscription(message);
  } catch (ex) {
    await log.error('Bitfinex websocket message handling error', { error: ex });
  }
};

/**
 * Subscribe to streaming trade channels.
 *
 * @private
 * @see https://docs.bitfinex.com/reference#ws-public-trades
 */
entity._subscribe = () => {
  const payload = {
    event: 'subscribe',
    channel: 'trades',
    pair: null,
  };

  entity.BITFINEX_PAIRS.forEach((pair) => {
    payload.pair = pair;
    const message = JSON.stringify(payload);
    entity.ws.send(message);
  });
};

/**
 * Handle a new bitfinex channel subscription.
 *
 * @param {Object} message Bitfinex incoming message.
 * @return {Promise<void>}
 * @private
 */
entity._handleSubscription = async (message) => {
  // {"event":"subscribed","channel":"trades","chanId":91,"symbol":"tBTCUSD","pair":"BTCUSD"}
  // suppress info messages
  if (message?.event === 'info') {
    return;
  }
  if (message?.event !== 'subscribed') {
    await log.info('Bitfinex WS received unknown message.', {
      custom: { message },
    });
    return;
  }

  if (message.channel !== 'trades') {
    await log.warn('bitfinex WS received bogus subscription', {
      custom: { message },
    });
    return;
  }

  const pair = entity.BITFINEX_TO_PAIRS[message.symbol];
  if (!pair) {
    await log.warn('bitfinex WS bogus pair resolution on subscription', {
      custom: {
        message,
      },
    });
    return;
  }
  entity._channels[message.chanId] = pair;
  await log.info(`Bitfinex WS subscribed to trade feed of: ${pair}`);
};

/**
 * Handle a new bitfinex trade broadcast.
 *
 * @param {Array<Object>} message Bitfinex incoming message.
 * @return {Promise<void>}
 * @private
 */
entity._handleTrade = async (message) => {
  // clear out events of no interest
  if (message.length !== 3) {
    return;
  }

  // [91,"te",[814055103,1630651866101,0.0202,49457]]
  //
  // heartbeat, ignore
  // [70151,"hb"]

  const [channel, action, data] = message;
  const [tradeId, timestamp, amount, price] = data;

  const pair = entity._channels[channel];
  if (!pair) {
    await log.warn('Bitfinex WS bogus incoming trade', {
      custom: {
        message,
      },
    });
    return;
  }

  events.emit(
    eventTypes.BITFINEX_TRADE,
    pair,
    price,
    tradeId,
    timestamp,
    amount,
    action,
  );
};
