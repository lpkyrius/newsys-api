require('dotenv').config();

const db = require('knex')({
    client: 'pg',
    connection: {
    host :    process.env.DB_HOST,
    port :    Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.SERVER_USER,
    password: process.env.DB_PASSWORD
    }
});

module.exports = {
    db,
}