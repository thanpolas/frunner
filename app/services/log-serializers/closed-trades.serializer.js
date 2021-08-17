/**
 * Serializes closed trades.
 *
 * @param {string=} usePath Set to override default log write path.
 * @return {function} Serializer for logality.
 */
module.exports = (usePath = 'context.closedTrades') => {
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
      value[`${index}_traded_source_tokens`] = tradeRecord.traded_source_tokens;
      value[`${index}_traded_source_token_symbol`] =
        tradeRecord.traded_source_token_symbol;
      value[`${index}_closed_tx`] = tradeRecord.closed_tx;
      value[`${index}_closed_profit_loss_number`] =
        tradeRecord.closed_profit_loss_number;
      value[`${index}_closed_profit_loss_percent`] =
        tradeRecord.closed_profit_loss_percent;
    });

    return {
      path: usePath,
      value,
    };
  };
};
