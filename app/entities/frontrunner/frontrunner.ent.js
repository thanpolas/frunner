/**
 * @fileoverview Frontrunner entity - core functionality.
 */

const {
  init: initHeartbeat,
  dispose: disposeHeartbeat,
} = require('./logic/heartbeat.ent');

const entity = (module.exports = {});

/**
 * Initialize frontrunner core functionality.
 *
 * @return {Promise<void>}
 */
entity.init = async () => {
  await initHeartbeat();
};

/**
 * Dispose of all the open handlers.
 *
 */
entity.dispose = () => {
  disposeHeartbeat();
};
