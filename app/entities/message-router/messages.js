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
* \`set [threshold]\` :: Define a new threshold.`;

messages.error = () =>
  'Unknown command, type `!help` for a list of available commands.';
