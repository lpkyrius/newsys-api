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

async function registerUser(user) {
    try {
        const insertedUser = await db('users')
        .returning('*')
        .insert({
            email: user.email,
            name: user.name,
            cpf: user.cpf, 
            joined: user.joined
        });
        return insertedUser;
      } catch (error) {
        console.log(`async function registerUser(user): ${ error }`)
        throw error;
      }
    }

module.exports = {
    getAllUsers,
    registerUser,
};