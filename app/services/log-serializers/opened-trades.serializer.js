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
      value[`${index}_pair`] = tradeRecord.pair;
      value[`${index}_network`] = tradeRecord.network;
      value[`${index}_traded_feed_price`] = tradeRecord.traded_feed_price;
      value[`${index}_traded_oracle_price`] = tradeRecord.traded_oracle_price;
      value[`${index}_traded_tx`] = tradeRecord.traded_tx;
      value[`${index}_traded_tokens_total`] = tradeRecord.traded_tokens_total;
      value[`${index}_traded_token_symbol`] = tradeRecord.traded_token_symbol;
      value[`${index}_testing`] = tradeRecord.testing;
    });

    return {
      path: usePath,
      value,
    };
  };
};
