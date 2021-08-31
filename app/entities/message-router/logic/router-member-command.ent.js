/**
 * @fileoverview Handles Member commands.
 */

const { msgError, help } = require('../messages');
const { startTrade } = require('../../frontrunner');

const log = require('../../../services/log.service').get();

const router = (module.exports = {});

/**
 * Handles commands from members.
 *
 * @param {DiscordMessage} message The incoming message.
 * @return {Promise<void>} A Promise.
 * @private
 */
router.handleChannelMessage = async (message) => {
  const [command] = message.content.split(' ');

  const commandLowerCase = command.toLowerCase();
  switch (commandLowerCase) {
    case 'help':
      await message.channel.send(help());
      break;
    case 'start':
      await router._invokeCommand(startTrade, message, 'start', false);
      break;

    default:
      await log.warn('handleChannelMessage() :: Bogus command invoked', {
        custom: {
          command,
        },
        relay: true,
        commandLowerCase,
      });
      break;
  }
};

/**
 * Invoke the command with try catch statements.
 *
 * @param {function} command The command to invoke.
 * @param {DiscordMessag} message The message that requested the command.
 * @param {string} commandName The command name for error logging.
 * @param {boolean} showTyping Set to true to have the bot appear as typing
 *    while the operation executes.
 * @return {Promise<void>} A Promise.
 * @private
 */
router._invokeCommand = async (
  command,
  message,
  commandName,
  showTyping = false,
) => {
  try {
    if (showTyping) {
      await message.channel.sendTyping();
    }

    await command(message);
  } catch (ex) {
    await log.error(`_invokeCommand() :: Error on ${commandName}()`, {
      error: ex,
      relay: true,
    });
    await message.channel.send(msgError());
  }
};
