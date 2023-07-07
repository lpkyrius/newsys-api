const { 
    registerUser, 
    getUserById, 
    getAllUsers, 
    updateUser,
    signinUser,
    confirmUser 
} = require('../../models/users.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');

function home(req, res) {
    return res.status(200).json({ message: 'New SAVIC - RCC Brasil'});
}

async function handleSignin(req, res) {
    try {
        let {email, password } = req.body;

        // data validation: right email/password format avoiding SQL Injection...
    
    
        const loginData = {email, password };
        const user = await signinUser(loginData, bcrypt, saltRounds) || [];
        if (user.id){
            if (!user.verified){
                res.status(400).json('Usuário ainda não confirmado via email de confirmação.');
            } else {
                res.status(201).json(user);
            }
        } else {
            res.status(400).json({ error: 'usuário ou senha inválidos'});
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
            return res.status(400).json({error: 'Data de registro inválida.',});
        }

        const userData = { email, name, cpf, joined, password };
        const registeredUser = await registerUser(userData);
        
        // Send confirmation email
        sendConfirmationEmail(email, registeredUser[0].id);
    
        res.status(201).json(registeredUser);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao registrar novo usuário.' });
    }
}

// Function to send confirmation email when a new user sign on
const sendConfirmationEmail = (email, userId) => {
    // Implement your email sending logic here
    // This is just a placeholder
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'new.savic.rccbrasil@gmail.com',
        pass: 'guvilxslnppbyavs'
      }
    });
  
    const confirmationLink = `http://localhost:8000/confirm/${userId}`;

    const mailOptions = {
      from: 'new.savic.rccbrasil@gmail.com',
      to: email,
      subject: 'Confirme seu registro no New SAVIC',
      html: `Para ter o acesso liberado ao New SAVIC da RCC Brasil, por favor, confirme seu email através deste link: <a href="${confirmationLink}">${confirmationLink}</a>`
    };    
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado: ' + info.response);
        }
    });
};
  // Function to handle user confirmation (return from the user register confirmation email)
async function handleConfirmation(req, res) {
    try {
        const userId = req.params.id;
        await confirmUser(userId);
        res.status(200).json({ message: 'Sucesso na confirmação do email do usuário.' });
    } catch (error) {
      res.status(500).json({ error: 'Falha ao confirmar usuário.' });
    }
}

async function httpGetAllUsers(req, res) {
    try {
        const recoveredUsers = await getAllUsers()
        if (recoveredUsers.length) {
            res.status(200).json(recoveredUsers);
        } else {
            res.status(400).json({ error: 'Não foi possível localizar usuários.'});
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
            res.status(400).json({ error: 'Não foi possível localizar o usuário.'});
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Falha ao localizar usuário.'});
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
            res.status(400).json({ error: 'Não foi atualizar os dados do usuário.'});
        }        
    } catch (error) {
        res.status(500).json(error);
    }   
}

module.exports = {
    home,
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser, 
    httpUpdateUser, 
    handleConfirmation
};