const { defaultFields } = require('../migration-helpers');

exports.up = async function (knex) {
  //
  // The trades roam table
  //
  await knex.schema.createTable('trades-roam', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('network', 20).notNullable();

    table.string('opportunity_source_symbol', 5).notNullable();
    table.float('opportunity_source_feed_price').notNullable();
    table.float('opportunity_source_oracle_price').notNullable();
    table.float('opportunity_source_usd_diff_percent').notNullable();
    table.string('opportunity_source_usd_diff_percent_hr', 10).notNullable();

    table.string('opportunity_target_symbol', 5).notNullable();
    table.float('opportunity_target_feed_price').notNullable();
    table.float('opportunity_target_oracle_price').notNullable();
    table.float('opportunity_target_usd_diff_percent').notNullable();
    table.string('opportunity_target_usd_diff_percent_hr', 10).notNullable();

    table.float('opportunity_source_target_diff_percent').notNullable();
    table.string('opportunity_source_target_diff_percent_hr', 10).notNullable();

    table.integer('opportunity_block_number').notNullable();

    table.string('traded_tx');
    table.integer('traded_block_number');

    table.float('traded_source_tokens');
    table.float('traded_source_usd_value');
    table.float('traded_target_tokens');
    table.float('traded_actual_ratio_between_tokens');

    table.bigInteger('traded_gas_spent');

    // calculate ratio between source & target using oracle prices and
    // then based on that price, calculate the percentage difference between them.
    table.float('closed_source_usd_value');
    table.float('closed_target_usd_value');
    table.float('closed_source_target_diff_percent');
    table.string('closed_source_target_diff_percent_hr', 10);

    // Translate the difference into USD
    table.float('closed_profit_loss_usd');
    table.float('closed_target_oracle_price');
    table.float('closed_source_oracle_price');

    //  Indicates the trade has concluded collecting data (happens after the
    // target token oracle changes value).
    table.boolean('closed_trade').defaultTo(false);
    table.timestamp('closed_at');

    table.boolean('testing').defaultTo(false);
    defaultFields(table, knex);

    table.index('opportunity_source_symbol');
    table.index('opportunity_target_symbol');
  });
};

exports.down = async function () {
  return true;
};
