/**
 * @fileoverview Bitfinex websockets integration.
 */

const WebSocket = require('ws');

const { events, eventTypes } = require('../../events');
const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

entity.BITFINEX_WS_ENDPOINT = 'wss://api-pub.bitfinex.com/ws/2';
entity.BITFINEX_PAIRS = ['tAAVE', 'tBTCUSD', 'tETHUSD', 'tLINK', 'tUNIUSD'];
entity.BITFINEX_TO_SYNTHS = {
  tAAVE: 'sAAVE',
  tBTCUSD: 'sBTC',
  tETHUSD: 'sETH',
  tLINK: 'sLINK',
  tUNIUSD: 'sUNI',
};

/** @type {Object?} websocket client */
entity.ws = null;

/**
 * Initialize the websocket client.
 *
 * @return {Promise<void>}
 */
entity.init = () => {
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

  if (!message?.event === 'subscribed') {
    await log.info('Bitfinex WS received unknown message.', {
      custom: { message },
    });
    return;
  }

  if (!message.channel === 'trades') {
    await log.warn('bitfinex WS received bogus subscription', {
      custom: { message },
    });
    return;
  }

  const synth = entity.BITFINEX_TO_SYNTHS[message.symbol];
  entity._channels[message.chanId] = synth;
  await log.info(`Bitfinex WS subscribed to trade feed of: ${synth}`);
};

/**
 * Handle a new bitfinex trade broadcast.
 *
 * @param {Array<Object>} message Bitfinex incoming message.
 * @return {Promise<void>}
 * @private
 */
entity._handleTrade = async (message) => {
  // We only care for the last message if there are multiple
  const lastTrade = message.pop();

  // [91,"te",[814055103,1630651866101,0.0202,49457]]
  //
  // heartbeat, ignore
  // [70151,"hb"]

  // discard heartbeat messages
  if (lastTrade[1] === 'hb') {
    return;
  }

  const [channel, action, data] = lastTrade;
  const [tradeId, timestamp, amount, price] = data;

  const symbol = entity.BITFINEX_TO_SYNTHS[channel];
  if (!symbol) {
    await log.warn('Bitfinex WS bogus incoming trade', {
      custom: lastTrade,
    });
    return;
  }

  events.emit(
    eventTypes.BITFINEX_TRADE,
    symbol,
    price,
    tradeId,
    timestamp,
    amount,
    action,
  );
};
