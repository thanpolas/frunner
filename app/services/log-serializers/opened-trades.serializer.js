/**
 * Serializes new trades.
 *
 * @param {string=} usePath Set to override default log write path.
 * @return {function} Serializer for logality.
 */
module.exports = (usePath = 'context.openedTrades') => {
  return (val) => {
    const value = {
      raw: val,

      pair: val.pair,
      network: val.network,
      traded_feed_price: val.traded_feed_price,
      traded_oracle_price: val.traded_oracle_price,
      traded_tx: val.traded_tx,
      traded_source_tokens: val.traded_source_tokens,
      traded_source_token_symbol: val.traded_source_token_symbol,
      testing: val.testing,
    };

    return {
      path: usePath,
      value,
    };
  };
};
