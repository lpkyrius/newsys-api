
const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432, // double-check the right PORT
      user : 'postgres',
      password : '',
      database : 'newsavic'
    }
});

module.exports = {
    db,
}