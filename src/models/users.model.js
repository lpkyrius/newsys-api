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
    console.log(`function registerUser(user): ${ error }`)
    throw error;
    }
}

async function getUser(id) {
    try {
        const recoveredUser = await db('users')
        .select('*').from('users').where({ id });
        return recoveredUser;
    } catch (error) {
    console.log(`function getUser(user): ${ error }`)
    throw error;
    }
}

module.exports = {
    getAllUsers,
    registerUser,
    getUser,
};