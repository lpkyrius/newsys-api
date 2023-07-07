const { db } = require('../services/postgresql');

async function getAllUsers() {
    try {
        const recoveredUsers = await db('users')
        .select('*').from('users');
        return recoveredUsers;
    } catch (error) {
    console.log(`function getAllUsers(user): ${ error }`)
    throw error;
    }
}

async function registerUser(user) {
    /*
        If the transaction function completes without throwing an error, 
        it automatically commits the changes made within the transaction. 
        If an error occurs, it automatically rolls back the transaction.
    */
    try {      
        const registeredUser = await db.transaction(async (trx) => {
            const insertedUser = await trx('users')
                .insert({ 
                    email: user.email, 
                    name: user.name, 
                    cpf: user.cpf, 
                    joined: user.joined 
                })
                .returning('*');
            await trx('login')
                .insert({ hash: user.password, email: insertedUser[0].email });
            return insertedUser;
          });
          return registeredUser;
        } catch (error) {
            console.log(`function registerUser(user): ${ error }`)
            throw error;
    }
}

async function getUserById(id) {
    try {
        const recoveredUser = await db('users')
        .select('*').from('users').where({ id });
        return recoveredUser;
    } catch (error) {
    console.log(`function getUser(user): ${ error }`)
    throw error;
    }
}


async function updateUser(userId, userData) {
    try {
        const {email, name, cpf } = userData
        const updatedUser = await db('users')
            .where('id', '=', userId)
            .update({
                email: email,
                name: name,
                cpf: cpf
              })
            .returning('*');
        return updatedUser;
    } catch (error) {
        console.log(`function updateUser(user): ${ error }`)
        throw error;
    }
}

async function signinUser(loginData, bcrypt, saltRounds) {
    try {
        let recoveredUser = [];
        let match = false;
        const recoveredLogin = await db('login')
        .select('*')
        .from('login')
        .where('email', '=', loginData.email);
        if (recoveredLogin.length){   
            match = await bcrypt.compare(loginData.password, recoveredLogin[0].hash);
            if (match){
                recoveredUser = await db('users')
                .select('*')
                .from('users')
                .where('email', '=', recoveredLogin[0].email);
            }
        }
        return recoveredUser[0];
    } catch (error) {
    console.log(`function signinUser(user): ${ error }`)
    throw error;
    }
}   

module.exports = {
    getAllUsers,
    registerUser,
    getUserById,
    updateUser,
    signinUser,
};