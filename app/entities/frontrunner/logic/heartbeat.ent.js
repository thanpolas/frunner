/**
 * @fileoverview The heartbeat is responsible for triggering and listening
 *    to events and re-distributing them normalized.
 */

const EventEmitter = require('events');

const config = require('config');

const { fetchPriceFeeds, processPriceFeeds } = require('./price-feeds.ent');
const { eventTypes } = require('../constants/event-types.const');

const log = require('../../../services/log.service').get();

const entity = (module.exports = {});

/** @type {number} counts how many heartbeats have happened  */
entity._heartbeat = 0;

/** @type {events?} Eventemitter instance. */
entity.events = null;

/** @type {events?} setInterval reference. */
entity._heartbeatInterval = null;

/**
 * Initialize the heartbeat functionality.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise<void>}
 */
entity.init = async (bootOpts) => {
  if (bootOpts.testing) {
    return;
  }

  // Create heartbeat
  entity._heartbeatInterval = setInterval(
    entity._onHeartbeat,
    config.app.heartbeat,
  );

  // Setup events
  entity.events = new EventEmitter({ captureRejections: true });

  entity.events.on('error', async (error) => {
    await log.error('heartbeat EventEmitter Error', {
      error,
      relay: true,
    });
  });

  // Handle promise rejection errors of event listeners
  entity.events[Symbol.for('nodejs.rejection')] = async (error) => {
    await log.error('heartbeat EventEmitter Promise Rejection', {
      error,
      relay: true,
    });
  };
};

/**
 * Dispose of all the open handlers.
 *
 */
entity.dispose = () => {
  clearInterval(entity._heartbeatInterval);
};

/**
 * Get the event emitter object.
 *
 * @return {Object} The events object.
 */
entity.getEvents = () => entity.events;

/**
 * Handles each heartbeat by fetching prices from feeds and propagating them
 * through events.
 *
 * @return {Promise<void>}
 */
entity._onHeartbeat = async () => {
  try {
    entity._heartbeat += 1;
    const prices = await fetchPriceFeeds();
    if (!prices) {
      return;
    }

    const processedPrices = processPriceFeeds(prices);

    entity.events.emit(eventTypes.PRICE_FEED, prices, entity._heartbeat);
    entity.events.emit(
      eventTypes.PRICE_FEED_PROCESSED,
      processedPrices,
      entity._heartbeat,
    );
  } catch (ex) {
    await log.error('_onHeartbeat() :: Failed', {
      error: ex,
      relay: true,
    });
  }
};
