exports.up = function(knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id');
            table.string('name', 100).notNullable();
            table.string('cpf', 11).notNullable();
            table.string('email', 100).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            table.boolean('verified').notNullable().defaultTo(false);
        })
        .alterTable('users', function(t) {
            t.unique('email')
        })
        .alterTable('users', function(t) {
            t.unique('cpf')
        })
        .createTable('login', function (table) {
            table.increments('id');
            table.string('hash', 100).notNullable();
            table.string('email', 100).notNullable();
        })
        .alterTable('login', function(t) {
            t.unique('email')
        })
        .createTable('user_verification', function (table) {
            table.increments('id');
            table.integer('user_id').references('id').inTable('users');
            table.string('unique_string', 100).notNullable();
            table.string('email', 100).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('expires_at').defaultTo(knex.fn.now());
        })
};
    
exports.down = function(knex) {
    return knex.schema
        .dropTable("user_verification")
        .dropTable("login")
        .dropTable("users");
};

exports.config = { transaction: false };