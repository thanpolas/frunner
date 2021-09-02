/**
 * @fileoverview Handle message commands to the bot.
 */

const config = require('config');

const { getClient } = require('../../services/discord.service');
const { handleChannelMessage } = require('./logic/router-member-command.ent');
const log = require('../../services/log.service').get();

const messageRouter = (module.exports = {});

/**
 * @const {Array<strimg>} ALLOWED_MEMBERS Discord member ids of members allowed
 *    to interact with the bot.
 */
const ALLOWED_MEMBERS = config.discord.allowed_members.split(',');

/** @const {Array<strimg>} PUBLIC_COMMANDS Public commands this bot listens to */
messageRouter.PUBLIC_COMMANDS = [
  'stop',
  'start',
  'test',
  'help',
  'threshold',
  'balance',
  'oraclestart',
  'oraclestop',
  'status',
];

/**
 * Initialize Discord event listeners for performing message router.
 *
 */
messageRouter.init = () => {
  log.info('Initializing message router entity...');
  const client = getClient();

  client.on('messageCreate', messageRouter._onMessage);
};

/**
 * Handles incoming message commands from discord.
 *
 * @param {DiscordMessage} message Discord Message Object.
 * @private
 */
messageRouter._onMessage = async (message) => {
  if (message.type !== 'DEFAULT') {
    return;
  }
  if (message.channel.type !== 'GUILD_TEXT') {
    return;
  }

  const discordAuthor = message.author;
  const client = getClient();

  // ignore own messages
  if (discordAuthor.id === client.user.id) {
    return;
  }

  // only allow approved members
  if (!ALLOWED_MEMBERS.includes(discordAuthor.id)) {
    return;
  }

  // Only care for commands this bot listens to.
  const [command] = message.content.split(' ');
  if (!messageRouter.PUBLIC_COMMANDS.includes(command)) {
    return;
  }

  await handleChannelMessage(message);
};
