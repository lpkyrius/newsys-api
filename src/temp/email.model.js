const bcrypt = require('bcrypt');
const db = require('./db');

// Function to handle user registration
async function registerUser(user) {
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

module.exports = {
  registerUser,
  confirmUser
};
