/**
 * Serializes closed trades.
 *
 * @param {string=} usePath Set to override default log write path.
 * @return {function} Serializer for logality.
 */
module.exports = (usePath = 'context.closedTrades') => {
  return (value) => {
    return {
      path: usePath,
      value,
    };
  };
};
