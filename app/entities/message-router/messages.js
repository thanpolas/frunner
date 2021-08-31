/**
 * @fileoverview Messages needed for command router.
 */

const messages = (module.exports = {});

messages.help = () =>
  `Available commands:

* \`help\` :: This help screen.
* \`start\` :: Start trading.
* \`stop\` :: Stop trading.
* \`test\` :: Toggle (start ot stop) testing mode.
* \`threshold [threshold]\` :: Define a new threshold, i.e. \`threshold 0.65%\`
* \`balance\` :: Get the current balances the bot has.`;

messages.error = () =>
  'Unknown command, type `!help` for a list of available commands.';

messages.msgError = () => "An unknown error occured, it's not you, it's me";
