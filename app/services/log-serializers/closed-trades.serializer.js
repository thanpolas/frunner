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
      pair: val.pair,
      network: val.network,
      traded_feed_price: val.traded_feed_price,
      traded_oracle_price: val.traded_oracle_price,
      traded_tx: val.traded_tx,
      traded_source_tokens: val.traded_source_tokens,
      traded_source_token_symbol: val.traded_source_token_symbol,
      closed_tx: val.closed_tx,
      closed_profit_loss_number: val.closed_profit_loss_number,
      closed_profit_loss_percent: val.closed_profit_loss_percent,
    };

    return {
      path: usePath,
      value,
    };
  };
};
