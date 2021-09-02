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
      'Closed Roam Trade | **Network**: optimistic_kovan | **Testing**: true' +
        ' | **Traded**: 10000sUNI -> 10000sLINK | **op %**: -0.05% - 3.00% =' +
        ' 3.05% | **cl %**: -10.77% | **op feed**: 28.39 - 25.26 | **cl orcl**:' +
        ' 28.4 - 25.34 | **cl vals**: $284000 - $253400 | **cl pr/ls**: $-30600' +
        ' | **principal**: 2033.78 (12359.56%) | **op-tr et**: 1" | **tr-cl et' +
        '**: 1.096"',
    );
  });
});
