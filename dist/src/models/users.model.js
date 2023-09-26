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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.resetLoginPassword = exports.deleteUserVerification = exports.getUserVerificationById = exports.newUserVerification = exports.updateEmail = exports.getKeyAlreadyUsedByAnotherId = exports.getUserByKey = exports.confirmUser = exports.signinUser = exports.updateUser = exports.getUserById = exports.registerUser = exports.getAllUsers = void 0;
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
exports.getAllUsers = getAllUsers;
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
exports.registerUser = registerUser;
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
exports.newUserVerification = newUserVerification;
function deleteUserVerification(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const registeredVerification = yield db('user_verification')
                .where({ user_id: user_id })
                .del();
        }
        catch (error) {
            console.log(`Error in deleteUserVerification(): ${error}`);
            throw error;
        }
    });
}
exports.deleteUserVerification = deleteUserVerification;
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
exports.getUserVerificationById = getUserVerificationById;
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
exports.confirmUser = confirmUser;
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
exports.getUserById = getUserById;
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
exports.getUserByKey = getUserByKey;
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
            console.log(`Error in getKeyAlreadyUsedByAnotherId(): ${error}`);
            throw error;
        }
    });
}
exports.getKeyAlreadyUsedByAnotherId = getKeyAlreadyUsedByAnotherId;
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
exports.updateUser = updateUser;
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
exports.updateEmail = updateEmail;
function signinUser(loginData, bcrypt, saltRounds) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let recoveredUser = [];
            let match = false;
            const recoveredLogin = yield db('login')
                .select('*')
                .from('login')
                .where('email', '=', loginData.email);
            if (recoveredLogin.length) {
                if (loginData.action === 'signin') { // login
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
            console.log(`Error in signinUser(): ${error}`);
            throw error;
        }
    });
}
exports.signinUser = signinUser;
function resetLoginPassword(loginData, bcrypt, saltRounds) {
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
exports.resetLoginPassword = resetLoginPassword;
function deleteUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch the user information before deleting
            const foundUser = yield db('users')
                .where('id', id)
                .first(); // Assuming there is only one matching record
            if (!foundUser) {
                return null;
            }
            // Delete the user info from all 3 tables
            // 1 - Delete any records from UserVerification
            yield deleteUserVerification(id);
            // 2 - Delete User & Login info
            const deletedUserInfo = yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const deletedLogin = yield trx('login')
                    .where({ id: id })
                    .del()
                    .returning("id");
                // 3 - Delete User Login info
                const deletedUser = yield trx('users')
                    .where({ id: id })
                    .del()
                    .returning("id");
            }));
            return foundUser;
        }
        catch (error) {
            console.log(`Error in deleteUser(): ${error}`);
            throw error;
        }
    });
}
exports.deleteUser = deleteUser;
