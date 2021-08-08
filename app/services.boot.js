/**
 * @fileoverview The services to boot.
 */

const log = require('./services/log.service').get();

const discordService = require('./services/discord.service');
const entities = require('./entities');
// const globals = require('./utils/globals');
// const migrationService = require('./services/migration.service');
// const postgresService = require('./services/postgres.service');

/**
 * Boots all the services of the application.
 *
 */
const appServices = (module.exports = {});

/**
 * Starts all the application's required services.
 * Triggers after all databases are connected.
 *
 * @param {Object} bootOpts Application boot options.
 * @param {boolean} bootOpts.testing When true go into testing mode.
 * @return {Promise} a promise.
 */
appServices.boot = async (bootOpts) => {
  log.notice('Booting Services...');

  // await migrationService.runHerokuMigration();
  // await postgresService.init();

  await discordService.init(bootOpts);

  // Boot all entities
  await log.notice('Booting entities...');
  await entities.init(bootOpts);

  await log.notice('Service Boot Finished', {
    relay: true,
    emoji: ':information_source:',
  });
};

/**
 * Dispose of all needed services for a gracefull shutdown.
 *
 * @return {Promise<void>}
 */
appServices.dispose = async () => {
  await discordService.dispose();
  entities.dispose();
  // await postgresService.dispose();
  // if (globals.isProd) {
  //   await cronService.dispose();
  // }
};
