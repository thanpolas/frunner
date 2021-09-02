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

    expect(message).toEqual(
      `--==Closed Roam Trade==--
**Network**: optimistic_kovan **Testing**: true
**Traded**: 10000sUNI -> 10000sLINK
**Opportunity % (source - target = diff)**: -0.05% - 3.00% = 3.05%
**Close % Profit/Loss**: -10.77%
**Opportunity Feed Prices**: 28.39 - 25.26
**Opportunity Oracle Prices**: 28.4 - 24.53
**Close Oracle Prices**: 28.4 - 25.34
**Close USD Value (source - target)**: $284000 - $253400
**Close Profit/Loss**: $-30600
**Principal and %**: 2033.78 (12359.56%)
**Opportunity to Trade Elapsed Time (seconds)**: 1"
**Trade to Close Elapsed Time (seconds)**: 1.096"
**Trade - Close Block**: 0 - 1054368`,
    );
  });
});
