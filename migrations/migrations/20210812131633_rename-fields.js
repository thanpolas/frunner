exports.up = async function (knex) {
  await knex.schema.alterTable('trades', (table) => {
    table.renameColumn('closed_profit_loss_tokens', 'closed_price_diff');
    table.renameColumn('closed_profit_loss_money', 'closed_profit_loss');
  });
};

exports.down = function () {
  return true;
};
