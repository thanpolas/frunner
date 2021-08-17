exports.up = async function (knex) {
  await knex.schema.alterTable('trades', (table) => {
    table.renameColumn('traded_tokens_total', 'traded_source_tokens');
    table.renameColumn('traded_token_symbol', 'traded_source_token_symbol');
    table.renameColumn('closed_profit_loss_percent', 'deprecated_delete');

    table.float('traded_dst_tokens');
    table.string('traded_dst_token_symbol', 10);
    table.bigInteger('traded_gas_spent');

    table.boolean('closed_cut_losses');
    table.float('closed_source_tokens');
    table.string('closed_source_token_symbol', 10);
    table.float('closed_dst_tokens');
    table.string('closed_dst_token_symbol', 10);
    table.bigInteger('closed_gas_spent');

    table.string('traded_projected_percent_hr', 10);
    table.string('closed_profit_loss_percent_hr', 10);
  });

  // Do in a separate callback to allow rename to take effect.
  await knex.schema.alterTable('trades', (table) => {
    table.float('closed_profit_loss_percent');
    table.dropColumn('deprecated_delete');
  });
};

exports.down = function () {
  return true;
};
