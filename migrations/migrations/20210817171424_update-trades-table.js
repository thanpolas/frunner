exports.up = async function (knex) {
  await knex.schema.alterTable('trades', (table) => {
    table.renameColumn('traded_tokens_total', 'traded_source_tokens');
    table.renameColumn('traded_token_symbol', 'traded_source_token_symbol');

    table.float('traded_dst_tokens');
    table.string('traded_dst_token_symbol');
  });
};

exports.down = function () {
  return true;
};
