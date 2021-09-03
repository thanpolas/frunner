/**
 * @fileoverview Bitfinex websockets integration.
 */

const WebSocket = require('ws');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

entity.BITFINEX_WS_ENDPOINT = 'wss://api-pub.bitfinex.com/ws/2';

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

    entity.ws.on('open', async function open() {
      await log.info('Bitfinext websocket connected.');
      resolve();
    });

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
 * Websocket message handler.
 *
 * @param {Object} message Websocket message.
 * @return {Promise<void>} A Promise.
 * @private
 */
entity._handleIncoming = async (message) => {
  try {
    console.log(message);
  } catch (ex) {
    await log.error('Bitfinex websocket message handling error', { error: ex });
  }
};
