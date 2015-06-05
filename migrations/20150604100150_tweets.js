
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tweets', function(table) {
    table.increments('tweet_id').primary();
    table.string('tweets');
    table.dateTime('posted_at');
    table.integer('users_id').references('id').inTable('users');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tweets');
};
