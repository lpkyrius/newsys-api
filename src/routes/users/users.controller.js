const { registerUser, getUser, getAllUsers } = require('../../models/users.model');
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
        const user = req.body;
        // let password = req.body.password;
        user.joined = new Date();
        if (isNaN(user.joined)) {
            return res.status(400).json({
                error: 'Data de registro inválida.',
            });
        }
        res.status(201).json(await registerUser(user));
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
        res.status(500).json('Falha ao localizar usuários.');
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

function updateUser(req, res) {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id){
            found = true;
            // update data

            return res.json(user);
        }
    })
    if (!found){
        res.status(400).json('Usuário não localizado');
    }
}


module.exports = {
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser, 
    updateUser
};