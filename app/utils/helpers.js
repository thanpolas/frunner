/**
 * @fileoverview Generic helpers
 */

const Bluebird = require('bluebird');

const helpers = (module.exports = {});

/**
 * Executes concurrently the Function "fn" against all the  items in the array.
 * Throttles of concurrency to 5.
 *
 * Use when multiple I/O operations need to be performed.
 *
 * @param {Array<*>} items Items.
 * @param {function(*): Promise<*>} fn Function to be applied on the array items.
 * @param {number=} concurrency The concurrency, default 5.
 * @return {Promise<*>}
 */
helpers.asyncMapCap = (items, fn, concurrency = 5) =>
  Bluebird.map(items, fn, { concurrency });

/**
 * An async delay, to time sending messages.
 *
 * @param {number} seconds How many seconds to wait.
 * @return {Promise<void>}
 */
helpers.delay = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

/**
 * Will split a string based on its length using numChars or the default value
 * of 1800 which is intented for spliting long discord messages (limit at 2000).
 *
 * @param {string} str The string to split.
 * @param {number=} [numChars=1800] Number of characters to split the string into.
 * @return {Array<string>} An array of strings, split based on the numChars.
 */
helpers.splitString = (str, numChars = 1800) => {
  const ret = [];
  let offset = 0;
  while (offset < str.length) {
    ret.push(str.substring(offset, numChars + offset));
    offset += numChars;
  }

  return ret;
};

/**
 * Returns a random number from 0 up to a total of maximum numbers
 * (not inclusive) as defined.
 *
 * @param {number} max Maximum random number to return.
 * @return {number} A random integer number.
 */
helpers.getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

/**
 * Converts an array of strings into numbers.
 *
 * @param {Array<string>} arr The array.
 * @return {Array<number>}
 */
helpers.arrToNumbers = (arr) => arr.map((item) => Number(item));

/**
 * Calculates the mean value.
 *
 * @param {Array<number>} arr The array to get the mean of.
 * @return {number} The mean value.
 */
helpers.meanOfArr = (arr) => {
  const total = arr.reduce((aggregate, val) => {
    return aggregate + val;
  }, 0);

  return total / arr.length;
};

/**
 * Calculates the median of an array.
 *
 * @param {Array<number>} arr The numbers to get the median from.
 * @return {number}
 */
helpers.medianOfArr = (arr) => {
  const arrSorted = arr.sort((a, b) => {
    return a - b;
  });

  const { length } = arrSorted;

  if (length % 2 === 1) {
    // If length is odd
    return arrSorted[length / 2 - 0.5];
  }

  return (arrSorted[length / 2] + arrSorted[length / 2 - 1]) / 2;
};
