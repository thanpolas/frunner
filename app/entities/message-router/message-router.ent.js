/**
 * @fileoverview Handle message commands to the bot.
 */

const config = require('config');

const { getClient } = require('../../services/discord.service');
const { handleMemberCommands } = require('./logic/router-member-command.ent');
const log = require('../../services/log.service').get();

const messageRouter = (module.exports = {});

/**
 * @const {Array<strimg>} ALLOWED_MEMBERS Discord member ids of members allowed
 *    to interact with the bot.
 */
const ALLOWED_MEMBERS = config.allowed_members.split(',');

/** @const {Array<strimg>} PUBLIC_COMMANDS Public commands this bot listens to */
messageRouter.PUBLIC_COMMANDS = [
  'stop',
  'start',
  'test',
  'help',
  'threshold',
  'balance',
];

/**
 * Initialize Discord event listeners for performing message router.
 *
 */
messageRouter.init = () => {
  log.info('Initializing message router entity...');
  const client = getClient();

  client.on('message', messageRouter._onMessage);
};

/**
 * Handles incoming message commands from discord.
 *
 * @param {DiscordMessage} message Discord Message Object.
 * @private
 */
messageRouter._onMessage = async (message) => {
  // only care for channel messages. (private are  type === "dm").
  if (message.channel.type !== 'text') {
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

  await handleMemberCommands(message);
};
