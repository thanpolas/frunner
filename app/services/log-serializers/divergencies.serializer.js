const { divergenceHr } = require('../../utils/helpers');

/**
 * Serializes divergencies.
 *
 * @param {string=} usePath Set to override default log write path.
 * @return {function} Serializer for logality.
 */
module.exports = (usePath = 'context.divergencies') => {
  return (val) => {
    const value = {
      raw: val,
    };

    const { oracleToFeed } = val;
    const pairs = Object.keys(oracleToFeed);

    pairs.forEach((pair) => {
      value[pair] = divergenceHr(oracleToFeed[pair]);
    });

    value.heartbeat = val.state.heartbeat;
    value.blocknumber = val.state.blockNumber;

    return {
      path: usePath,
      value,
    };
  };
};
