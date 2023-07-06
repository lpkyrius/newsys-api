const { 
    registerUser, 
    getUser, 
    getAllUsers, 
    updateUser 
} = require('../../models/users.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const pass1 = 'ann123';
const hash1 = '$2b$10$PxMr1mHQ3ZzD241Ibp1Pueiqh1YLwKC4GydyEnXD83VUrcHSw8WQC';
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            cpf: '00000000000',
            email: 'john@gmail.com',
            joined: new Date(),
            password: 'john123',
        },
        {
            id: '124',
            name: 'Sally',
            cpf: '00000000000',
            email: 'sally@gmail.com',
            joined: new Date(),
            password: 'sally123',
        }
    ],
    login: [
        {
            id: '223',
            hash: '',
            email: 'john@gmail.com',
        }
    ] 
};

function handleSignin(req, res, bcrypt) {
    // bcrypt.compare(pass1, hash1, function(err, res) {
    //     console.log('first guess', res);
    // });
    // bcrypt.compare("34w342", hash1, function(err, res) {
    //     console.log('second guess', res);
    // });
    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password){
            return res.json('success');
        } else {
            return res.status(400).json('Erro no login :(');
        }
}

async function handleRegister(req, res, bcrypt) {
    try {
        let {email, name, cpf, password } = req.body;
        const joined = new Date();
        
        // data validation
        if (isNaN(joined)) {
            return res.status(400).json({
                error: 'Data de registro inválida.',
            });
        }
        
        const userData = {email, name, cpf, joined };
        res.status(201).json(await registerUser(userData));
        
        // send confirmation email

    } catch (error) {
        res.status(500).json({ error: 'Falha ao registrar novo usuário.' });
    }
}

async function httpGetAllUsers(req, res) {
    try {
        const recoveredUsers = await getAllUsers()
        if (recoveredUsers.length) {
            res.status(200).json(recoveredUsers);
        } else {
            res.status(400).json('Não foi possível localizar usuários.');
        }
    } catch (error) {
        res.status(500).json({ error: 'Falha ao localizar usuários.' });
    }
}

async function httpGetUser(req, res) {
    try {
        const { id } = req.params;
        const recoveredUser = await getUser(id)
        if (recoveredUser.length) {
            res.status(200).json(recoveredUser[0]);
        } else {
            res.status(400).json('Não foi possível localizar o usuário.');
        }
        
    } catch (error) {
        res.status(500).json('Falha ao localizar usuário.');
    }
}


async function httpUpdateUser(req, res) {
    try {
        const userId = req.params.id;
        let {email, name, cpf } = req.body;

        // data validation
        // cpf = "55555555556";
        const userData = {email, name, cpf };

        const updatedUser = await updateUser(userId, userData);
        if (updatedUser.length) {
            res.status(200).json(updatedUser[0]);
        } else {
            res.status(400).json('Não foi atualizar os dados do usuário.');
        }        
    } catch (error) {
        res.status(500).json(error);
    }   
}

module.exports = {
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser, 
    httpUpdateUser
};