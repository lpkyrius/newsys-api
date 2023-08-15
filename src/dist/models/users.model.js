"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { db } = require('../services/postgresql');
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredUsers = yield db('users')
                .select('*').from('users');
            return recoveredUsers;
        }
        catch (error) {
            console.log(`Error in getAllUsers(): ${error}`);
            throw error;
        }
    });
}
function registerUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            If the transaction function completes without throwing an error,
            it automatically commits the changes made within the transaction.
            If an error occurs, it automatically rolls back the transaction.
        */
        try {
            const registeredUser = yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const insertedUser = yield trx('users')
                    .insert({
                    email: user.email,
                    name: user.name,
                    cpf: user.cpf,
                    created_at: user.created_at
                })
                    .returning('*');
                yield trx('login').insert({ hash: user.password, email: insertedUser[0].email });
                return insertedUser;
            }));
            return registeredUser;
        }
        catch (error) {
            console.log(`Error in registerUser(): ${error}`);
            throw error;
        }
    });
}
function newUserVerification(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const registeredVerification = yield db('user_verification')
                .insert({
                user_id: data.user_id,
                unique_string: data.unique_string,
                email: data.email,
                created_at: data.created_at,
                expires_at: data.expires_at // 6 hours
            })
                .returning('*');
            return registeredVerification;
        }
        catch (error) {
            console.log(`Error in newUserVerification(): ${error}`);
            throw error;
        }
    });
}
function deleteUserVerification(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const registeredVerification = yield db('user_verification')
                .where({ user_id })
                .del();
        }
        catch (error) {
            console.log(`Error in newUserVerification(): ${error}`);
            throw error;
        }
    });
}
// Function to confirm user and update verified field
function getUserVerificationById(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredData = yield db('user_verification')
                .select('*')
                .from('user_verification')
                .where({ user_id })
                .orderBy('id', 'desc'); // the most recent one
            return recoveredData;
        }
        catch (error) {
            console.log(`Error in getUserVerificationById(): ${error}`);
            throw error;
        }
    });
}
function confirmUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedUser = yield db('users')
                .where('id', '=', userId)
                .update({
                verified: true,
                updated_at: new Date()
            })
                .returning('*');
            return updatedUser;
        }
        catch (error) {
            console.log(`Error in confirmUser(): ${error}`);
            throw error;
        }
    });
}
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredUser = yield db('users')
                .select('*').from('users').where({ id });
            return recoveredUser;
        }
        catch (error) {
            console.log(`Error in getUserById(): ${error}`);
            throw error;
        }
    });
}
function getUserByKey(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredUser = yield db('users')
                .select('*')
                .from('users')
                .where(key);
            return recoveredUser;
        }
        catch (error) {
            console.log(`Error in getUserByKey(): ${error}`);
            throw error;
        }
    });
}
function getKeyAlreadyUsedByAnotherId(id, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredUser = yield db('users')
                .select('*').from('users')
                .whereNot(id)
                .andWhere(key);
            return recoveredUser;
        }
        catch (error) {
            console.log(`Error in getUserByKey(): ${error}`);
            throw error;
        }
    });
}
function updateUser(userId, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, cpf } = userData;
            const updatedUser = yield db('users')
                .where('id', '=', userId)
                .update({
                name: name,
                cpf: cpf,
                updated_at: new Date()
            })
                .returning('*');
            return updatedUser;
        }
        catch (error) {
            console.log(`Error in updateUser(): ${error}`);
            throw error;
        }
    });
}
function updateEmail(userId, oldEmail, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedUserLogin = yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const updatedUser = yield trx('users')
                    .where('id', '=', userId)
                    .update({
                    email: userData.email,
                    verified: userData.verified,
                    updated_at: new Date()
                })
                    .returning('*');
                const updatedLogin = yield trx('login')
                    .where('email', '=', oldEmail)
                    .update({
                    email: updatedUser[0].email
                })
                    .returning('*');
                return updatedUser;
            }));
            return updatedUserLogin;
        }
        catch (error) {
            console.log(`Error in updateEmail(): ${error}`);
            throw error;
        }
    });
}
function SignInUser(loginData, bcrypt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let recoveredUser = [];
            let match = false;
            const recoveredLogin = yield db('login')
                .select('*')
                .from('login')
                .where('email', '=', loginData.email);
            if (recoveredLogin.length) {
                if (loginData.action === 'SignIn') { // login
                    match = yield bcrypt.compare(loginData.password, recoveredLogin[0].hash);
                    if (match) {
                        recoveredUser = yield db('users')
                            .select('*')
                            .from('users')
                            .where('email', '=', recoveredLogin[0].email);
                    }
                }
                else { // get password for reset
                    return recoveredLogin;
                }
            }
            return recoveredUser[0];
        }
        catch (error) {
            console.log(`Error in SignInUser(): ${error}`);
            throw error;
        }
    });
}
function resetLoginPassword(loginData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedLogin = yield db('login')
                .where('email', '=', loginData.email)
                .update({ hash: loginData.password })
                .returning('*');
            return updatedLogin[0];
        }
        catch (error) {
            console.log(`Error in resetLoginPassword(): ${error}`);
            throw error;
        }
    });
}
module.exports = {
    getAllUsers,
    registerUser,
    getUserById,
    updateUser,
    SignInUser,
    confirmUser,
    getUserByKey,
    getKeyAlreadyUsedByAnotherId,
    updateEmail,
    newUserVerification,
    getUserVerificationById,
    deleteUserVerification,
    resetLoginPassword,
};
