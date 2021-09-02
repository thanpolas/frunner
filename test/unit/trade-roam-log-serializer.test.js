/**
 * @fileoverview Test trade-roam closed trade serializer.
 */

require('../lib/test.lib');

const {
  _formatRoamTrade,
} = require('../../app/entities/discord/logic/relay-to-admin.ent');
const { closedTrade } = require('../fixtures/trade-roam.fix');

describe('UNIT trade-roam log-relay serialzier', () => {
  test('Will return appropriate string message', () => {
    const logContext = {
      context: {
        closedTrade: {
          raw: closedTrade(),
        },
      },
    };

    const message = _formatRoamTrade(logContext);

    console.log(message);
  });
});
