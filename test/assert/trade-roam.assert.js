/**
 * @fileoverview trade roam record assertions.
 */

const assert = (module.exports = {});

/**
 * Determines if the provided object is of type that complies with the API Spec.
 *
 * @param {Object} testObj The object to test.
 * @param {Object=} optFixtureOpen Optionally provide the fixture used to open
 *    (create) the trade record.
 * @param {Object=} optFixtureClose Optionally provide the fixture used to close
 *    the trade record.
 * @throws {Error} if assertions failed.
 */
assert.assert = (testObj, optFixtureOpen, optFixtureClose) => {
  if (!testObj) {
    throw new Error('Empty object passed on assertion');
  }

  assert.assertProperties(testObj);
  assert.assertTypes(testObj, optFixtureClose);
  assert.assertValues(testObj, optFixtureOpen, optFixtureClose);
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
    'network',
    'opportunity_source_symbol',
    'opportunity_source_feed_price',
    'opportunity_source_oracle_price',
    'opportunity_source_usd_diff_percent',
    'opportunity_source_usd_diff_percent_hr',
    'opportunity_target_symbol',
    'opportunity_target_feed_price',
    'opportunity_target_oracle_price',
    'opportunity_target_usd_diff_percent',
    'opportunity_target_usd_diff_percent_hr',
    'opportunity_source_target_diff_percent',
    'opportunity_source_target_diff_percent_hr',
    'opportunity_block_number',
    'traded_tx',
    'traded_block_number',
    'traded_source_tokens',
    'traded_source_usd_value',
    'traded_target_tokens',
    'traded_actual_ratio_between_tokens',
    'traded_gas_spent',
    'traded_at',
    'closed_source_usd_value',
    'closed_target_usd_value',
    'closed_source_target_diff_percent',
    'closed_source_target_diff_percent_hr',
    'closed_profit_loss_usd',
    'closed_source_oracle_price',
    'closed_target_oracle_price',
    'closed_trade',
    'closed_block_number',
    'closed_at',
    'testing',
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
  expect(testObj.id).toBeString();
  expect(testObj.network).toBeString();
  expect(testObj.opportunity_source_symbol).toBeString();
  expect(testObj.opportunity_source_feed_price).toBeNumber();
  expect(testObj.opportunity_source_oracle_price).toBeNumber();
  expect(testObj.opportunity_source_usd_diff_percent).toBeNumber();
  expect(testObj.opportunity_source_usd_diff_percent_hr).toBeString();
  expect(testObj.opportunity_target_symbol).toBeString();
  expect(testObj.opportunity_target_feed_price).toBeNumber();
  expect(testObj.opportunity_target_oracle_price).toBeNumber();
  expect(testObj.opportunity_target_usd_diff_percent).toBeNumber();
  expect(testObj.opportunity_target_usd_diff_percent_hr).toBeString();
  expect(testObj.opportunity_source_target_diff_percent).toBeNumber();
  expect(testObj.opportunity_source_target_diff_percent_hr).toBeString();
  expect(testObj.opportunity_block_number).toBeNumber();
  expect(testObj.traded_tx).toBeString();
  expect(testObj.traded_block_number).toBeNumber();
  expect(testObj.traded_source_tokens).toBeNumber();
  expect(testObj.traded_source_usd_value).toBeNumber();
  expect(testObj.traded_target_tokens).toBeNumber();
  expect(testObj.traded_actual_ratio_between_tokens).toBeNumber();
  expect(testObj.traded_gas_spent).toBeString();
  expect(testObj.traded_at).toBeDate();

  if (optFixtureClose) {
    expect(testObj.closed_source_usd_value).toBeNumber();
    expect(testObj.closed_target_usd_value).toBeNumber();
    expect(testObj.closed_source_target_diff_percent).toBeNumber();
    expect(testObj.closed_source_target_diff_percent_hr).toBeString();
    expect(testObj.closed_profit_loss_usd).toBeNumber();
    expect(testObj.closed_source_oracle_price).toBeNumber();
    expect(testObj.closed_target_oracle_price).toBeNumber();
    expect(testObj.closed_block_number).toBeNumber();
    expect(testObj.closed_at).toBeDate();
  } else {
    expect(testObj.closed_source_usd_value).toBeNull();
    expect(testObj.closed_target_usd_value).toBeNull();
    expect(testObj.closed_source_target_diff_percent).toBeNull();
    expect(testObj.closed_source_target_diff_percent_hr).toBeNull();
    expect(testObj.closed_profit_loss_usd).toBeNull();
    expect(testObj.closed_source_oracle_price).toBeNull();
    expect(testObj.closed_target_oracle_price).toBeNull();
    expect(testObj.closed_block_number).toBeNull();
    expect(testObj.closed_at).toBeNull();
  }
  expect(testObj.closed_trade).toBeBoolean();
  expect(testObj.testing).toBeBoolean();
  expect(testObj.created_at).toBeDate();
  expect(testObj.updated_at).toBeDate();
};

/**
 * Assert the test object's properties have the expected values.
 *
 * @param {Object} testObj The object to test.
 * @param {Object=} optFixtureOpen Optionally provide the fixture used to open
 *    (create) the trade record.
 * @param {Object=} optFixtureClose Optionally provide the fixture used to close
 *    the trade record.
 * @throws {Error} if assertions failed.
 */
assert.assertValues = (testObj) => {
  expect(testObj.id).toBeUUID();
  expect(testObj.network).toEqual('optimistic_kovan');
  expect(testObj.opportunity_source_symbol).toEqual('sUNI');
  expect(testObj.testing).toBeTrue();
};
