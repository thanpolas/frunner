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
    };

    val.forEach((tradeRecord, index) => {
      value[`pair_${index}`] = tradeRecord.pair;
      value[`network_${index}`] = tradeRecord.network;
      value[`traded_feed_price_${index}`] = tradeRecord.traded_feed_price;
      value[`traded_oracle_price_${index}`] = tradeRecord.traded_oracle_price;
      value[`traded_tx_${index}`] = tradeRecord.traded_tx;
      value[`traded_tokens_total_${index}`] = tradeRecord.traded_tokens_total;
      value[`traded_token_symbol_${index}`] = tradeRecord.traded_token_symbol;
      value[`testing_${index}`] = tradeRecord.testing;
    });

    return {
      path: usePath,
      value,
    };
  };
};
