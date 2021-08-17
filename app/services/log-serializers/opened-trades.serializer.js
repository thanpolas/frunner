/**
 * Serializes new trades.
 *
 * @param {string=} usePath Set to override default log write path.
 * @return {function} Serializer for logality.
 */
module.exports = (usePath = 'context.openedTrade') => {
  return (val) => {
    if (!val) {
      return { path: usePath };
    }
    const value = {
      raw: val,

      pair: val.pair,
      network: val.network,
      traded_feed_price: val.traded_feed_price,
      traded_oracle_price: val.traded_oracle_price,
      traded_tx: val.traded_tx,
      traded_source_tokens: val.traded_source_tokens,
      traded_source_token_symbol: val.traded_source_token_symbol,
      traded_projected_percent_hr: val.traded_projected_percent_hr,
      testing: val.testing,
    };

    return {
      path: usePath,
      value,
    };
  };
};
