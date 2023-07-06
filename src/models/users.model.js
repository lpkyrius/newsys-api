const { db } = require('../services/postgresql');

const database = {
    users: [
        {
            id: 1,
            name: 'John',
            cpf: '00000000000',
            email: 'john@gmail.com',
            joined: new Date(),
            password: 'john123',
        },
        {
            id: 2,
            name: 'Sally',
            cpf: '00000000000',
            email: 'sally@gmail.com',
            joined: new Date(),
            password: 'sally123',
        }
    ]
};

function getAllUsers() {
    return database.users;
}

function registerUser(user) {
    return db('users')
    .returning('*')
    .insert({
        email: user.email,
        name: user.name,
        cpf: user.cpf, 
        joined: user.joined
    })
    .then(user => {
        //console.log('user (model): ', user[0]);
        return user[0];
    })
    .catch(function(err) {
        console.error('Oops: ', err);
        return err;
      });
    // .catch(err => res.status(400).json('Oops, problema ao tentar registrar-se!'))
}

module.exports = {
    getAllUsers,
    registerUser,
};