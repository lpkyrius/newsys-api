const { 
    registerUser, 
    getUserById, 
    getAllUsers, 
    updateUser,
    signinUser 
} = require('../../models/users.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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

async function handleSignin(req, res) {
    try {
        let {email, password } = req.body;

        // data validation: right email/password format avoiding SQL Injection...
    
    
        const loginData = {email, password };
        const user = await signinUser(loginData, bcrypt, saltRounds) || [];
        if (user.id){
            res.status(201).json(user);
        } else {
            res.status(400).json('usuário ou senha inválidos');
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro na tentativa de login.' });
    }
}

async function handleRegister(req, res) {
    try {
        let {email, name, cpf, password } = req.body;
        const joined = new Date();

        // data validation
        password = bcrypt.hashSync(password, saltRounds);

        if (isNaN(joined)) {
            return res.status(400).json({
                error: 'Data de registro inválida.',
            });
        }

        const userData = {email, name, cpf, joined, password };
        res.status(201).json(await registerUser(userData));
        
        // send confirmation email, when it returns, we should update login.verified = true;

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
        const recoveredUser = await getUserById(id)
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