/**
 * Serializes closed trades.
 *
 * @param {string=} usePath Set to override default log write path.
 * @return {function} Serializer for logality.
 */
module.exports = (usePath = 'context.closedTrade') => {
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
      closed_tx: val.closed_tx,
      closed_profit_loss: val.closed_profit_loss,
      traded_projected_percent_hr: val.traded_projected_percent_hr,
      closed_profit_loss_percent_hr: val.closed_profit_loss_percent_hr,
      closed_dst_tokens: val.closed_dst_tokens,
      closed_cut_losses: val.closed_cut_losses,
      testing: val.testing,
    };

    return {
      path: usePath,
      value,
    };
  };
};
