/**
 * @fileoverview Initializes the Logality library and provides the .get() method.
 * @see https://github.com/thanpolas/logality
 */

const Logality = require('logality');

/**
 * WARNING
 *
 * Do not require any other modules at this point, before the log service
 * init() method has been invoked.
 *
 * WARNING
 */

// Serializers
const relaySerializer = require('./log-serializers/relay.serializer');
const openedTradeSerializer = require('./log-serializers/opened-trades.serializer');
const closedTradeSerializer = require('./log-serializers/closed-trades.serializer');
const divergenciesSerializer = require('./log-serializers/divergencies.serializer');
const pairSerializer = require('./log-serializers/pair.serializer');

const logger = (module.exports = {});

logger.logality = null;

/**
 * Initialize the logging service.
 *
 * @param {Object} bootOpts boot options. This module will check for:
 * @param {string=} bootOpts.appName Set a custom appname for the logger.
 * @param {boolean=} bootOpts.suppressLogging Do not log to stdout.
 */
logger.init = function (bootOpts = {}) {
  // check if already initialized.
  if (logger.logality) {
    return;
  }

  const appName = bootOpts.appName || 'frontrunner';

  const serializers = {
    relay: relaySerializer(),
    openedTrade: openedTradeSerializer(),
    closedTrade: closedTradeSerializer(),
    divergencies: divergenciesSerializer(),
    pair: pairSerializer(),
  };

  logger.logality = new Logality({
    prettyPrint: true,
    appName,
    async: true,
    serializers,
  });

  // Create the get method
  logger.get = logger.logality.get.bind(logger.logality);

  // Add middleware
  logger._addMiddleware();
};

/**
 * Will add middleware to the logger.
 *
 * @private
 */
logger._addMiddleware = () => {
  const { loggerToAdmin } = require('../entities/discord');

  // relay flagged messages to discord
  logger.logality.use(loggerToAdmin);

  // remove raw keys
  logger.logality.use(logger._removeRawKeys);
};

/**
 * Removes "raw" keys from context values.
 *
 * @param {Object} logContext Logality log context object.
 */
logger._removeRawKeys = (logContext) => {
  if (logContext.context?.closedTrade?.raw) {
    delete logContext.context.closedTrade.raw;
  }
  if (logContext.context?.openedTrade?.raw) {
    delete logContext.context.openedTrade.raw;
  }
  if (logContext.context?.divergencies?.raw) {
    delete logContext.context.divergencies.raw;
  }
};
