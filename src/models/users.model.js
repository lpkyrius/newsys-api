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

        await trx('login').insert({ hash: user.password, email: insertedUser[0].email });

        return insertedUser;
    });

    return registeredUser;

    } catch (error) {
    console.log(`function registerUser(user): ${error}`);
    throw error;
    }
}

// Function to confirm user and update verified field
async function confirmUser(userId) {
    try {
        await db('users').where('id', userId).update({ verified: true });
    } catch (error) {
        console.log(`function confirmUser(userId): ${error}`);
        throw error;
    }
}

async function getUserById(id) {
    try {
        const recoveredUser = await db('users')
        .select('*').from('users').where({ id });
        return recoveredUser;
    } catch (error) {
        console.log(`function getUserById(id): ${ error }`)
        throw error;
    }
}

async function getUserByKey(key) {
    try {
        const recoveredUser = await db('users')
        .select('*').from('users').where(key);
        return recoveredUser;
    } catch (error) {
        console.log(`function getUserByKey(): ${ error }`)
        throw error;
    }
}

async function getKeyAlreadyUsedByAnotherId(id, key) {
    try {
        const recoveredUser = await db('users')
        .select('*').from('users')
            .whereNot(id)
            .andWhere(key);

        return recoveredUser;
    } catch (error) {
        console.log(`function getUserByKey(): ${ error }`)
        throw error;
    }
}

async function updateUser(userId, userData) {
    try {
        const {name, cpf } = userData
        const updatedUser = await db('users')
            .where('id', '=', userId)
            .update({
                name: name,
                cpf: cpf
              })
            .returning('*');
        return updatedUser;
    } catch (error) {
        console.log(`function updateUser(): ${ error }`)
        throw error;
    }
}

async function updateEmail(userId, userData) {
    try {
        const currentUserData = await getUserByKey({id: userId});
        if (currentUserData[0].email == userData.email){
            return [];
        } else {
            const updatedUserLogin = await db.transaction(async (trx) => {
                const updatedUser = await trx('users')
                .where('id', '=', userId)
                .update(userData)
                .returning('*');
            
            const updatedLogin = await trx('login')
                .where('email', '=', currentUserData[0].email)
                .update({ email: updatedUser[0].email })
                .returning('*');
    
                return updatedUser;
            });
    
            return updatedUserLogin;
        }
    } catch (error) {
        console.log(`function updateEmail(): ${ error }`)
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
    confirmUser,
    getUserByKey,
    getKeyAlreadyUsedByAnotherId,
    updateEmail,
};