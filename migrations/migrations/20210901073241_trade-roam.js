const { defaultFields } = require('../migration-helpers');

exports.up = async function (knex) {
  //
  // The trades roam table
  //
  await knex.schema.createTable('trades-roam', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('pair');
    table.string('network', 20).notNullable();

    table.string('opportunity_source_token_symbol', 5).notNullable();
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

    table.string('traded_tx').notNullable();
    table.integer('traded_block_number').notNullable();

    table.float('traded_source_tokens').notNullable();
    table.float('traded_dst_tokens').notNullable();
    table.float('traded_actual_price_between_tokens').notNullable();

    table.bigInteger('traded_gas_spent').notNullable();

    // calculate ratio between source & target using oracle prices and
    // then based on that price, calculate the percentage difference between them.
    table.float('traded_source_target_diff_percent').notNullable();
    table.string('traded_source_target_diff_percent_hr', 10).notNullable();

    // Translate the difference into USD
    table.float('traded_profit_loss_usd');

    table.boolean('testing').defaultTo(false).notNullable();

    defaultFields(table, knex);

    table.index('pair');
    table.index('closed_trade');
  });
};

exports.down = async function () {
  return true;
};
