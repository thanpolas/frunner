const { defaultFields } = require('../migration-helpers');

exports.up = async function (knex) {
  // Required if gen_random_uuid() PG method doesn't work:
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  //
  // The trades table
  //
  await knex.schema.createTable('trades', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('pair');
    table.float('opportunity_feed_price').notNullable();
    table.float('opportunity_oracle_price').notNullable();
    table.integer('opportunity_block_number').notNullable();
    table.string('network', 20).notNullable();
    table.boolean('traded').defaultTo(false).notNullable();
    table.float('traded_feed_price');
    table.float('traded_oracle_price');
    table.float('traded_projected_percent');
    table.integer('traded_block_number');
    table.string('traded_tx');
    table.float('traded_tokens_total');
    table.string('traded_token_symbol', 5);
    table.boolean('closed_trade').defaultTo(false).notNullable();
    table.timestamp('closed_at');
    table.string('closed_tx');
    table.float('closed_profit_loss_number');
    table.string('closed_profit_loss_percent', 10);
    table.float('closed_feed_price');
    table.float('closed_oracle_price');
    table.integer('closed_block_number');
    table.boolean('testing').defaultTo(false).notNullable();

    defaultFields(table, knex);

    table.index('pair');
    table.index('closed_trade');
  });
};

exports.down = async function () {
  return true;
};
