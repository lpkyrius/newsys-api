const { 
    registerUser, 
    getUserByKey, 
    getAllUsers, 
    updateUser,
    signinUser,
    confirmUser, 
    getKeyAlreadyUsedByAnotherId,
    updateEmail
} = require('../../models/users.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const passwordSize = 5;

function home(req, res) {
    return res.status(200).json({ message: 'New SAVIC - RCC Brasil'});
}

async function handleSignin(req, res) {
    try {
        let {email, password } = req.body;
        // data validation: right email/password format avoiding SQL Injection...
        if (email == "" || password == ""){
            res.status(400).json({error: 'Campo em branco.',});
        } else if (password.length < passwordSize){
            res.status(400).json(`Senha deve ter ao menos ${ passwordSize } caracteres.`);
        } else if (!checkEmail(email)){
            res.status(400).json('Email inválido.');
        } else {
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
        if (email == "" || name == "" || cpf == "" || password == ""){
            res.status(400).json({error: 'Campo em branco.',});
        } else if (isNaN(joined)) {
            res.status(400).json({error: 'Data de registro inválida.',});
        } else if (!checkUsername(name)){
            res.status(400).json('Nome inválido.');
        } else if (!checkEmail(email)){
            res.status(400).json('Email inválido.');
        } else if (password.length < passwordSize){
            res.status(400).json(`Senha deve ter ao menos ${ passwordSize } caracteres.`);
        } else if (!TestaCPF(cpf)){
            res.status(400).json('CPF inválido.');
        } else if (await checkCpfExists(cpf)){
            res.status(400).json('CPF já cadastrado.');
        } else if (await checkEmailExists(email)){
            res.status(400).json('Email já cadastrado.');
        } else {
            password = bcrypt.hashSync(password, saltRounds);
            const userData = { email, name, cpf, joined, password };
            const registeredUser = await registerUser(userData);
            // Send confirmation email
            sendConfirmationEmail(email, registeredUser[0].id);
            res.status(201).json(registeredUser);
        }
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
async function handleEmailConfirmation(req, res) {
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
        const key = req.params;
        // Validation
        if (isNaN(Number(key.id))){
            return res.status(400).json({ error: 'Id de usuário deve ser em formato numérico.'});
        }
        const recoveredUser = await getUserByKey(key);
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
        let { name, cpf } = req.body;
        
        // Validation
        if (!checkUserName(name)){
            res.status(400).json('Nome inválido.');
        } else if (!TestaCPF(cpf)){
            res.status(400).json('CPF inválido.');
        } else if (await checkCpfAlreadyUsed(userId,cpf)){
            res.status(400).json('CPF já cadastrado.');
        } else {
            const userData = { name, cpf };

            const updatedUser = await updateUser(userId, userData);
            if (updatedUser.length) {
                res.status(200).json(updatedUser[0]);
            } else {
                res.status(400).json({ error: 'Não foi atualizar os dados do usuário.'});
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }   
}

async function httpUpdateUserEmail(req, res) {
    try {
        const userId = req.params.id;
        let { email } = req.body;
        
        // Validation
        if (!checkEmail(email)){
            res.status(400).json('Email inválido.');
        } else if (await checkEmailAlreadyUsed(userId,email)){
            res.status(400).json('Email já cadastrado.');
        } else {
            // update email and verified (false) in order to force validate the email again
            const userData = { email: email, verified: false };
            const updatedUser = await updateEmail(userId, userData);
            if (updatedUser.length) {
                // Send confirmation email
                sendConfirmationEmail(email, updatedUser[0].id);
                res.status(200).json(updatedUser[0]);
            } else {
                res.status(400).json({ error: 'Não foi atualizar o email do usuário.'});
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }   
}

// Block of validation functions
function checkUserName(name) {
    // The number of characters must be between 3 and 100. 
    // The string should only contain alphanumeric characters and/or underscores (_).
    // The first character of the string should be alphabetic
    if(/^[A-Za-z\s]{3,100}$/.test(name)) {
        return true; // valid
    } else {
        return false; // invalid
    }
}
function checkEmail(email) {
    if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return false; // invalid
    } else if (email.length < 3 || email.length > 100){
        return false; // invalid
    } else {
        return true; // valid
    }
}

async function checkEmailExists(email){
    const key = { email: email }
    const exists = await getUserByKey(key);
    if (exists.length){
        return true;
    } else {
        return false;
    }
}

async function checkCpfExists(cpf){
    const key = { cpf: cpf }
    const exists = await getUserByKey(key);
    if (exists.length){
        return true;
    } else {
        return false;
    }
}

async function checkCpfAlreadyUsed(id, cpf){
    const idSearch = { id: id };
    const keySearch = { cpf: cpf };
    const exists = await getKeyAlreadyUsedByAnotherId(idSearch, keySearch);
    if (exists.length){
        return true;
    } else {
        return false;
    }
}

async function checkEmailAlreadyUsed(id, email){
    const idSearch = { id: id };
    const keySearch = { email: email };
    const exists = await getKeyAlreadyUsedByAnotherId(idSearch, keySearch);
    if (exists.length){
        return true;
    } else {
        return false;
    }
}

function TestaCPF(strCPF) {
    let Soma;
    let Resto;
    Soma = 0;
  if (strCPF == "00000000000") return false;

  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}

module.exports = {
    home,
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser, 
    httpUpdateUser, 
    handleEmailConfirmation,
    httpUpdateUserEmail
};