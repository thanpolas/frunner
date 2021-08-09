/**
 * @fileoverview Asserts prices value from all dexes / cexes.
 */

const assert = (module.exports = {});

/**
 * Determines if the provided object is of type that complies with the API Spec.
 *
 * @param {Object} testObj The object to test.
 * @throws {Error} if assertions failed.
 */
assert.assert = (testObj) => {
  if (!testObj) {
    throw new Error('Empty object passed on assertion');
  }

  assert.assertProperties(testObj);
  assert.assertTypes(testObj);
  assert.assertValues(testObj);
};

/**
 * Assert the test object has the expected properties.
 *
 * @param {Object} testObj The object to test.
 * @throws {Error} if assertions failed.
 */
assert.assertProperties = (testObj) => {
  expect(testObj).toContainAllKeys([
    'BTCUSD',
    'ETHUSD',
    'LINKUSD',
    'UNIUSD',
    'AAVEUSD',
  ]);
};

/**
 * Assert the test object's properties have the expected types.
 *
 * @param {Object} testObj The object to test.
 * @throws {Error} if assertions failed.
 */
assert.assertTypes = (testObj) => {
  expect(testObj.BTCUSD).toBeNumber();
  expect(testObj.ETHUSD).toBeNumber();
  expect(testObj.LINKUSD).toBeNumber();
  expect(testObj.UNIUSD).toBeNumber();
  expect(testObj.AAVEUSD).toBeNumber();
};

/**
 * Assert the test object's properties have the expected values.
 *
 * @param {Object} testObj The object to test.
 * @throws {Error} if assertions failed.
 */
assert.assertValues = (/* testObj */) => {};
