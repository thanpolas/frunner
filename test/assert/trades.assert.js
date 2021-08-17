/**
 * @fileoverview Assert trades model.
 */

const assert = (module.exports = {});

/**
 * Determines if the provided object is of type that complies with the API Spec.
 *
 * @param {Object} testObj The object to test.
 * @param {string=} optPair Optionally define the pair being examined.
 * @param {Object=} optFixtureOpen Optionally provide the fixture used to open
 *    (create) the trade record.
 * @param {Object=} optFixtureClose Optionally provide the fixture used to close
 *    the trade record.
 * @throws {Error} if assertions failed.
 */
assert.assert = (testObj, optPair, optFixtureOpen, optFixtureClose) => {
  if (!testObj) {
    throw new Error('Empty object passed on assertion');
  }

  assert.assertProperties(testObj);
  assert.assertTypes(testObj, optFixtureClose);
  assert.assertValues(testObj, optPair, optFixtureOpen, optFixtureClose);
};

/**
 * Assert the test object has the expected properties.
 *
 * @param {Object} testObj The object to test.
 * @throws {Error} if assertions failed.
 */
assert.assertProperties = (testObj) => {
  expect(testObj).toContainAllKeys([
    'id',
    'pair',
    'opportunity_feed_price',
    'opportunity_oracle_price',
    'opportunity_block_number',
    'network',
    'traded',
    'traded_feed_price',
    'traded_oracle_price',
    'traded_projected_percent',
    'traded_projected_percent_hr',
    'traded_block_number',
    'traded_tx',
    'traded_source_tokens',
    'traded_source_token_symbol',
    'traded_dst_tokens',
    'traded_dst_token_symbol',
    'traded_gas_spent',
    'closed_trade',
    'closed_at',
    'closed_tx',
    'closed_price_diff',
    'closed_profit_loss',
    'closed_profit_loss_percent',
    'closed_profit_loss_percent_hr',
    'closed_feed_price',
    'closed_oracle_price',
    'closed_block_number',
    'testing',
    'closed_cut_losses',
    'closed_source_tokens',
    'closed_source_token_symbol',
    'closed_dst_tokens',
    'closed_dst_token_symbol',
    'closed_gas_spent',
    'created_at',
    'updated_at',
  ]);
};

/**
 * Assert the test object's properties have the expected types.
 *
 * @param {Object} testObj The object to test.
 * @param {Object=} optFixtureClose Optionally provide the fixture used to close
 *    the trade record.
 * @throws {Error} if assertions failed.
 */
assert.assertTypes = (testObj, optFixtureClose) => {
  expect(testObj.id).toBeUUID();
  expect(testObj.pair).toBeString();
  expect(testObj.opportunity_feed_price).toBeNumber();
  expect(testObj.opportunity_oracle_price).toBeNumber();
  expect(testObj.opportunity_block_number).toBeNumber();
  expect(testObj.network).toBeString();
  expect(testObj.traded).toBeBoolean();
  expect(testObj.traded_feed_price).toBeNumber();
  expect(testObj.traded_oracle_price).toBeNumber();
  expect(testObj.traded_projected_percent).toBeNumber();
  expect(testObj.traded_projected_percent_hr).toBeString();
  expect(testObj.traded_block_number).toBeNumber();
  expect(testObj.traded_tx).toBeString();
  expect(testObj.traded_source_tokens).toBeNumber();
  expect(testObj.traded_source_token_symbol).toBeString();
  expect(testObj.closed_trade).toBeBoolean();

  if (optFixtureClose) {
    expect(testObj.closed_at).toBeDate();
    expect(testObj.closed_tx).toBeString();
    expect(testObj.closed_price_diff).toBeNumber();
    expect(testObj.closed_profit_loss).toBeNumber();
    expect(testObj.closed_profit_loss_percent).toBeNumber();
    expect(testObj.closed_profit_loss_percent_hr).toBeString();
    expect(testObj.closed_feed_price).toBeNumber();
    expect(testObj.closed_oracle_price).toBeNumber();
    expect(testObj.closed_block_number).toBeNumber();
  } else {
    expect(testObj.closed_at).toBeNull();
    expect(testObj.closed_tx).toBeNull();
    expect(testObj.closed_price_diff).toBeNull();
    expect(testObj.closed_profit_loss).toBeNull();
    expect(testObj.closed_profit_loss_percent).toBeNull();
    expect(testObj.closed_feed_price).toBeNull();
    expect(testObj.closed_oracle_price).toBeNull();
    expect(testObj.closed_block_number).toBeNull();
  }

  expect(testObj.testing).toBeBoolean();
  expect(testObj.created_at).toBeDate();
  expect(testObj.updated_at).toBeDate();
};

/**
 * Assert the test object's properties have the expected values.
 *
 * @param {Object} testObj The object to test.
 * @param {string=} optPair Optionally define the pair being examined.
 * @param {Object=} optFixtureOpen Optionally provide the fixture used to open
 *    (create) the trade record.
 * @param {Object=} optFixtureClose Optionally provide the fixture used to close
 *    the trade record.
 * @throws {Error} if assertions failed.
 */
assert.assertValues = (testObj, optPair, optFixtureOpen, optFixtureClose) => {
  if (optFixtureOpen) {
    const fixOpen = optFixtureOpen;
    const pair = optPair;

    expect(testObj.pair).toEqual(pair);
    expect(testObj.traded_feed_price).toEqual(fixOpen.state.feedPrices[pair]);
    expect(testObj.traded_oracle_price).toEqual(
      fixOpen.state.oraclePrices[pair],
    );
    expect(testObj.opportunity_block_number).toEqual(fixOpen.state.blockNumber);
    expect(testObj.network).toEqual('optimistic_kovan');
    expect(testObj.testing).toBeTrue();
    expect(testObj.traded).toBeTrue();
    expect(testObj.traded_feed_price).toEqual(fixOpen.state.feedPrices[pair]);
    expect(testObj.traded_oracle_price).toEqual(
      fixOpen.state.oraclePrices[pair],
    );
    expect(testObj.traded_block_number).toEqual(fixOpen.state.blockNumber);
    expect(testObj.traded_tx).toEqual('0x');
    expect(testObj.traded_source_tokens).toEqual(10000);
    expect(testObj.traded_source_token_symbol).toEqual('sUSD');
  }

  if (optFixtureClose) {
    const fixClose = optFixtureClose;
    const pair = optPair;
    const oraclePrice = fixClose.state.oraclePrices[pair];

    expect(testObj.closed_trade).toBeTrue();
    expect(testObj.closed_at).toBeDate();
    expect(testObj.closed_tx).toEqual('0x');
    expect(testObj.closed_feed_price).toEqual(fixClose.state.feedPrices[pair]);
    expect(testObj.closed_oracle_price).toEqual(oraclePrice);
    expect(testObj.closed_block_number).toEqual(fixClose.state.blockNumber);
  }
};
