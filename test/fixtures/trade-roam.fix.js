/**
 * @fileoverview Trade roaming strategy fixtures.
 */

const fix = (module.exports = {});

fix.closedTrade = () => {
  return {
    id: '174e9d70-acf9-4a67-bb07-72272bd1cfde',
    network: 'optimistic_kovan',
    opportunity_source_symbol: 'sUNI',
    opportunity_source_feed_price: 28.39,
    opportunity_source_oracle_price: 28.4,
    opportunity_source_usd_diff_percent: -0.000547074,
    opportunity_source_usd_diff_percent_hr: '-0.05%',
    opportunity_target_symbol: 'sLINK',
    opportunity_target_feed_price: 25.26,
    opportunity_target_oracle_price: 24.53,
    opportunity_target_usd_diff_percent: 0.03,
    opportunity_target_usd_diff_percent_hr: '3.00%',
    opportunity_source_target_diff_percent: 0.0305471,
    opportunity_source_target_diff_percent_hr: '3.05%',
    opportunity_block_number: 1054367,
    traded_tx: '0x',
    traded_block_number: 0,
    traded_source_tokens: 10000,
    traded_source_usd_value: 10000,
    traded_target_tokens: 10000,
    traded_actual_ratio_between_tokens: 1,
    traded_gas_spent: '0',
    closed_source_usd_value: 284000,
    closed_target_usd_value: 253400,
    closed_source_target_diff_percent: -0.107746,
    closed_source_target_diff_percent_hr: '-10.77%',
    closed_profit_loss_usd: -30600,
    closed_source_oracle_price: 28.4,
    closed_target_oracle_price: 25.34,
    closed_block_number: 1054368,
    closed_trade: true,
    testing: true,
    closed_at: '2021-09-02T11:32:51.357Z',
    created_at: '2021-09-02T11:32:49.261Z',
    updated_at: '2021-09-02T11:32:51.357Z',

    traded_at: '2021-09-02T11:32:50.261Z',
  };
};
