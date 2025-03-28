/**
 * @fileoverview Handles Member commands.
 */

const { msgError, help } = require('../messages');
const {
  startTrade,
  stopTrade,
  testToggle,
  setThreshold,
  getBalance,
  startOracleTrack,
  stopOracleTrack,
  status,
} = require('../../frontrunner');

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
    case 'stop':
      await router._invokeCommand(stopTrade, message, 'stop', false);
      break;
    case 'test':
      await router._invokeCommand(testToggle, message, 'test', false);
      break;
    case 'threshold':
      await router._invokeCommand(setThreshold, message, 'threshold', false);
      break;
    case 'balance':
      await router._invokeCommand(getBalance, message, 'balance', true);
      break;
    case 'oraclestart':
      await router._invokeCommand(
        startOracleTrack,
        message,
        'oraclestart',
        false,
      );
      break;
    case 'oraclestop':
      await router._invokeCommand(
        stopOracleTrack,
        message,
        'oraclestop',
        false,
      );
      break;
    case 'status':
      await router._invokeCommand(status, message, 'status', true);
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
