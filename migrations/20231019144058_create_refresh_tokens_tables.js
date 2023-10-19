exports.up = function(knex) {
    return knex.schema
        .createTable('refresh_tokens', function (table) {
            table.increments('id');
            table.integer('user_id').references('id').inTable('users');
            table.string('refresh_token', 200).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
};
    
exports.down = function(knex) {
    return knex.schema
        .dropTable("refresh_tokens")
};

exports.config = { transaction: false };