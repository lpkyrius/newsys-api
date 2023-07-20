const { 
    registerUser, 
    getUserByKey, 
    getAllUsers, 
    updateUser,
    signinUser,
    confirmUser, 
    getKeyAlreadyUsedByAnotherId,
    updateEmail,
    newUserVerification,
    getUserVerificationById,
    deleteUserVerification,
    resetLoginPassword
} = require('../../models/users.model');

const passwordSize = Number(process.env.PASSWORD_MIN_SIZE || 8);

// hash handler
const bcrypt = require('bcrypt');
const saltRounds = 10;

// email handler
const nodemailer = require('nodemailer');

// unique string 
const {v4: uuidv4} = require('uuid');

// env variables
require('dotenv').config();

// path for static verified page
const path = require("path");

// web token
const jwt = require('jsonwebtoken');

async function handleSignin(req, res) {
    try {
        let {email, password } = req.body;
        // data validation: right email/password format avoiding SQL Injection...
        if (email == "" || password == ""){
            res.status(400).json({ error: 'Dados inválidos.' });
        } else if (password.length < passwordSize){
            res.status(400).json({ error: `Senha deve ter ao menos ${ passwordSize } caracteres.` });
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'Email inválido.' });
        } else {
            const loginData = {
                email: email, 
                password: password,
                action: 'signin'
            };
            const user = await signinUser(loginData, bcrypt, saltRounds) || [];
            if (user.id){
                if (!user.verified){
                    res.status(400).json({ error: 'Usuário ainda não confirmado via email de confirmação.' });
                } else {
                    res.status(200).json(user);
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
        email = email.slice(0,100);
        name = name.slice(0,100);
        cpf = cpf.slice(0,11); 
        if (email == "" || name == "" || cpf == "" || password == ""){
            res.status(400).json({ error: 'Dados inválidos.' });
        } else if (isNaN(joined)) {
            res.status(400).json({ error: 'Data de registro inválida.' });
        } else if (!checkUserName(name)){
            res.status(400).json({ error: 'Nome inválido.' });
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'Email inválido.' });
        } else if (password.length < passwordSize){
            res.status(400).json({ error: `Senha deve ter ao menos ${ passwordSize } caracteres.` });
        } else if (!TestaCPF(cpf)){
            res.status(400).json({ error: 'CPF inválido.' });
        } else if (await checkCpfExists(cpf)){
            res.status(400).json({ error: 'CPF já cadastrado.' });
        } else if (await checkEmailExists(email)){
            res.status(400).json({ error: 'Email já cadastrado.' });
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
const sendConfirmationEmail = async (email, userId) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.AUTH_EMAIL,
              pass: process.env.AUTH_PASS,
            }
        });
        const uniqueString = uuidv4() + userId;
        const confirmationLink = `http://localhost:8000/confirm_email/${userId}/${uniqueString}`;
        const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Confirme seu registro no New SAVIC',
        html: `
        <html>
            <head>
            <style>
                /* CSS styles for the email content */
                body {
                font-family: Arial, sans-serif;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
                }
                .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                h1 {
                color: #333333;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
                }
                p {
                color: #555555;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 10px;
                }
                b {
                font-weight: bold;
                }
                a {
                color: #ffffff;
                background-color: #e9b722;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                }
                a:hover {
                background-color: #45a049;
                }
            </style>
            </head>
            <body>
            <div class="container" align="center">
                <h1>Confirme seu registro no New SAVIC</h1>
                <p>Para ter acesso liberado ao <b>New SAVIC da RCC Brasil</b>,
                <br>por favor, confirme seu e-mail através do link abaixo:</p>
                <p><b>Este link vai expirar em 6 horas.</b></p>
                <p><a href="${confirmationLink}">Confirme aqui</a></p><br>
                <p><b>Se tiver problemas com o botão acima, 
                <br>copie e cole o link abaixo no seu navegador:</b></p>
                ${confirmationLink}
            </div>
            </body>
        </html>
      `
    };    
        const createdAt = Date.now();
        const expiresAt = Date.now() + Number(process.env.EMAIL_EXPIRATION || 21600000); // 6 hours
        const hashedUniqueString = bcrypt.hashSync(uniqueString, saltRounds);
        const newVerification = {
                    user_id: userId,
                    unique_string: hashedUniqueString,
                    created_at: new Date(createdAt),
                    expires_at: new Date(expiresAt),
                    email: email 
                }
        const registeredVerification = await newUserVerification(newVerification);
        if (registeredVerification.length){
            transporter.verify((error, success) => {
                if (error) {
                    console.log('sendConfirmationEmail verify',error);
                } else {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log('sendConfirmationEmail error sending email');
                        } else {
                            // turning off this console to avoid warnings messages in SuperJest automated tests
                            if (process.env.SHOW_CONSOLE_EMAIL==='1') {
                                console.log('Email enviado: ' + info.response);
                            }
                        }
                    });     
                }
            });
        } else {
            console.log('sendConfirmationEmail can not save userVerification data');
            let message = "Ocorreu um problema ao acessar sua verificação de email.";
            res.redirect(`/verified/?error=true&message=${message}`);
        }
          
    } catch (error) {
        console.log('sendConfirmationEmail', error);
    }
};

function handleEmailConfirmationVerified(req, res){
    res.sendFile(path.join(__dirname, "../../views/verified.html"));
}

function handleEmailConfirmationError(req, res, message){
    message = (message === undefined) ? "" : '?error=true&message='+message;
    const redirectUrl = '/email_verified' + message;
    res.redirect(redirectUrl);
}

// Function to handle user confirmation (return from the user register confirmation email)
async function handleEmailConfirmation(req, res) {
    try {
        let {id, uniqueString} = req.params;
        if (isNaN(id)){
            let message = `Problemas na id. 
                <br>Por favor, verifique novamente o link enviado.`;
            const errorQueryString = `?error=true&message=${message}`;
            handleEmailConfirmationError(req, res, message);
        } else {
            const verificationData = await getUserVerificationById(id);
            if (verificationData.length) {
                // force testing with expired record
                // let expiresAt2 = Date.now() - Number(process.env.EMAIL_EXPIRATION || 21600000); 
                // const expires_at = new Date(expiresAt2);
                const { expires_at } = verificationData[0];
                const hashedUniqueString = verificationData[0].unique_string;

                if (expires_at < Date.now()){
                    deleteUserVerification(verificationData[0].id);
                    let message = `O prazo para confirmação do email expirou. 
                        <br>Para receber um novo email, <br>utilize a opção [esqueci minha senha]`;
                    handleEmailConfirmationError(req, res, message);
                } else {
                    const match = await bcrypt.compare(uniqueString, hashedUniqueString);
                    if (match){
                        const updatedUser = await confirmUser(id);
                        if (updatedUser.length) {
                            // The verification record is not necessary any more
                            deleteUserVerification(verificationData[0].id);
                            handleEmailConfirmationError(req, res);
                        } else {
                            let message = `<p>Não foi possível alterar o registro de confirmação do email do usuário.
                            <br>Por favor, tente iniciar a sessão no New SAVIC ou registrar-se novamente.`;
                            handleEmailConfirmationError(req, res, message);
                        }
                    } else {
                        let message = `Problema nas chaves de segurança. 
                            <br>Por favor, confira o link de verificação novamente.`;
                        handleEmailConfirmationError(req, res, message);
                    }
                }
            } else {
                let message = `A conta vinculada a essa verificação não existe ou já foi verificada.
                    <br>Por favor, tente iniciar a sessão no New SAVIC ou registrar-se novamente.`;
                handleEmailConfirmationError(req, res, message);
            }
        }
    } catch (error) {
        let message = `Falha ao confirmar usuário.
                    <br>Por favor, confira o link de verificação ou tente registrar-se novamente.`;
                handleEmailConfirmationError(req, res, message);
    }
}

async function httpGetAllUsers(req, res) {
    try {
        const recoveredUsers = await getAllUsers()
        if (recoveredUsers.length) {
            res.status(200).json(recoveredUsers);
        } else {
            res.status(400).json({ error: 'Não foi possível localizar usuários.' });
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
            res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Falha ao localizar usuário.' });
    }
}

async function httpUpdateUser(req, res) {
    try {
        const userId = req.params.id;
        let { name, cpf } = req.body;      
        // Validation
        name = name.slice(0,100);
        cpf = cpf.slice(0,11);  
        if (isNaN(Number(userId))){
            res.status(400).json({ error: 'Id de usuário deve ser em formato numérico.'});
        } else if (!checkUserName(name)){
            res.status(400).json({ error: 'Nome inválido.' });
        } else if (!TestaCPF(cpf)){
            res.status(400).json({ error: 'CPF inválido.' });
        } else if (await checkCpfAlreadyUsed(userId,cpf)){
            res.status(400).json({ error: 'CPF já cadastrado.' });
        } else {
            const userData = { name, cpf };
            const updatedUser = await updateUser(userId, userData);
            if (updatedUser.length) {
                res.status(200).json(updatedUser[0]);
            } else {
                res.status(400).json({ error: 'Não foi possível atualizar os dados do usuário.' });
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
        if (isNaN(Number(userId))){
            res.status(400).json({ error: 'Id de usuário deve ser em formato numérico.'});
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'Email inválido.' });
        } else if (await checkEmailAlreadyUsed(userId,email)){
            res.status(400).json({ error: 'Email já cadastrado.' });
        } else {
            const recoveredUser = await getUserByKey({ id: userId});
            if (!recoveredUser.length) {
                res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
            } else {
                const checkIfEmailChanged = await getUserByKey({id: userId});
                // To verify if we are actually changing the email or if it's still the same
                if (checkIfEmailChanged.length && checkIfEmailChanged[0].email == email){
                    res.status(200).json(checkIfEmailChanged[0]);
                } else {
                    // update email and update verified=false in order to force validate the email again
                    const userData = { email: email, verified: false };
                    const updatedUser = await updateEmail(userId, checkIfEmailChanged[0].email, userData);
                    if (updatedUser.length) {
                        // Send confirmation email
                        await sendConfirmationEmail(email, updatedUser[0].id);
                        res.status(200).json(updatedUser[0]);
                    } else {
                        res.status(400).json({ error: 'Não foi possível atualizar o email do usuário.' });
                    }
                }
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
    let validaKey = ((process.env.CPF_VALIDATION || "1") == "1") ? true : false;
    if (!validaKey) {
        return true; // validation has been turned off.
    } else {
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
}

async function httpRenderForgotPassword(req, res, next){
    res.render(path.join(__dirname, "../../views/forgot_password"));
}

async function httpPostForgotPassword(req, res, next){
    try {
        const { email } = req.body;
        if (email == ""){
            res.status(400).json({ error: 'Email inválido.' });
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'Email inválido.' });
        } else {
            const recoveredUser = await getUserByKey({ email: email });
            if (!recoveredUser.length) {
                res.status(400).json({ error: 'Email inválido.' });
            } else {
                const loginData = {
                    email: email,
                    action: 'reset_password'
                };
                const login = await signinUser(loginData, bcrypt, saltRounds) || [];
                if (login.length){
                    // Create a one time link valid for 30 minutes
                    const JWT_SECRET = process.env.JWT_SECRET || 'new_savic';
                    // Let's use the current password making this link one time valid
                    const secret = JWT_SECRET + login.password; 
                    const payload = {
                        email: login[0].email,
                        id: login[0].id
                    }
                    const expiresIn = process.env.EMAIL_RESET_LINK_EXPIRATION || '15m';
                    const token = jwt.sign(payload,secret, { expiresIn: expiresIn });
                    const serverAddress = `${process.env.SERVER_ADDRESS || 'http://localhost'}:${process.env.PORT || '8000'}`;
                    const resetPasswordLink = `${serverAddress}/reset_password/${recoveredUser[0].id}/${token}`;
                    console.log('debug httpPostForgotPassword resetPasswordLink', resetPasswordLink);
                    res.status(200).json({ message: 'O link para redefinir a senha foi enviado para o seu email.' });
                } else {
                    res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
                }
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

async function httpResetPassword(req, res, next){
    try {
        const { id, token } = req.params;
        if (id == "" || token == ""){
            res.status(400).json({ error: 'Parametros inválidos.' });
        } else if (isNaN(Number(id))){
            res.status(400).json({ error: 'Formato id inválido.'});
        } else {
            const recoveredUser = await getUserByKey({ id });
            if (!recoveredUser.length) {
                res.status(400).json({ error: 'Id inválida.' });
            } else {
                const loginData = {
                    email: recoveredUser[0].email,
                    action: 'reset_password'
                };
                const login = await signinUser(loginData, bcrypt, saltRounds) || [];
                if (login.length){
                    // Create a one time link valid for 30 minutes
                    const JWT_SECRET = process.env.JWT_SECRET || 'new_savic';
                    // Let's use the current password making this link one time valid
                    const secret = JWT_SECRET + login[0].password; 
                    try {
                        const payload = jwt.verify(token, secret);
                        res.render(path.join(__dirname, "../../views/reset_password"), {email: login[0].email});
                    } catch (error) {
                        // Handle TokenExpiredError
                        if (error.name === 'TokenExpiredError') {
                            res.status(400).json({ error: 'O link de redefinição de senha expirou. Por favor, solicite um novo link.' });
                        } else if (error.name === 'JsonWebTokenError') {
                            res.status(400).json({ error: 'O link de redefinição de senha é inválido. Verifique se o link está correto ou solicite um novo link.' });
                        } else {
                            console.log(error.message);
                            res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
                            // throw error; // Rethrow other unexpected errors
                        }
                    }
                } else {
                    res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
                }    
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

async function httpPostResetPassword(req, res, next){
    try {
        const { id, token } = req.params;
        const { password, password2 } = req.body;
        if (id == "" || token == ""){
            res.status(400).json({ error: 'Parametros inválidos.' });
        } else if (isNaN(Number(id))){
            res.status(400).json({ error: 'Formato id inválido.'});
        } else if (password.length < passwordSize){
            res.status(400).json({ error: `Senha deve ter ao menos ${ passwordSize } caracteres.` });
        } else if (password !== password2){
            res.status(400).json({ error: 'Senha definida e senha confirmada são diferentes.'});
        }else {    

            const recoveredUser = await getUserByKey({ id });
            if (!recoveredUser.length) {
                res.status(400).json({ error: 'Id inválida.' });
            } else {
                const loginData = {
                    email: recoveredUser[0].email,
                    action: 'reset_password'
                };
                const login = await signinUser(loginData, bcrypt, saltRounds) || [];
                if (login.length){
                    // Create a one time link valid for 30 minutes
                    const JWT_SECRET = process.env.JWT_SECRET || 'new_savic';
                    // Let's use the current password making this link one time valid
                    const secret = JWT_SECRET + login[0].password; 
                    try {
                        const payload = jwt.verify(token, secret);
                        // req.checkBody('password', 'Senha não informada.').notEmpty();
                        // req.checkBody('password', 'Senha deve possuir ao menos 6 posições.').isLength({min:6});
                        // req.checkBody('password2', 'Senhas informadas não conferem.').equals(req.body.password);
                        const newPassword = bcrypt.hashSync(password, saltRounds);
                        const loginData = { 
                            email: recoveredUser[0].email,
                            password: newPassword
                        };
                        const resetedPassword = await resetLoginPassword(loginData, bcrypt, saltRounds);
                        if (!resetedPassword.email){
                            res.status(400).json({ error: 'Não foi possível atualizar o email. Verifique se informou a nova senha corretamente ou tente redefinir novamente.' });
                        } else {
                            res.status(200).json({ message: `Senha redefinida com sucesso para ${ resetedPassword.email }` });
                        }                      
                        // res.render(path.join(__dirname, "../../views/reset_password"), {email: login[0].email});
                    } catch (error) {
                        // Handle TokenExpiredError
                        if (error.name === 'TokenExpiredError') {
                            res.status(400).json({ error: 'O link de redefinição de senha expirou. Por favor, solicite um novo link.' });
                        } else if (error.name === 'JsonWebTokenError') {
                            res.status(400).json({ error: 'O link de redefinição de senha é inválido. Verifique se o link está correto ou solicite um novo link.' });
                        } else {
                            console.log(error.message);
                            throw error; // Rethrow other unexpected errors
                        }
                    }
                }
            }            
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
    httpUpdateUser, 
    handleEmailConfirmation,
    httpUpdateUserEmail,
    handleEmailConfirmationVerified,
    handleEmailConfirmationError,
    httpRenderForgotPassword, 
    httpPostForgotPassword,
    httpResetPassword,
    httpPostResetPassword
};