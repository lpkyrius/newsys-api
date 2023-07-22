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
            sendConfirmationEmail(email, registeredUser[0].id, 'register');
            res.status(201).json(registeredUser);
        }
    } catch (error) {
        res.status(500).json({ error: 'Falha ao registrar novo usuário.' });
    }
}

// Function to send confirmation email when a new user sign on
const sendConfirmationEmail = async (email, userId, goal) => {
    try {
        let expiresAt = 0;
        let routeLink = '';
        let subject = '';
        let titulo = '';
        let body_message ='';
        if (goal==='register' || goal === 'update_user_email'){
            expiresAt = Date.now() + Number(process.env.EMAIL_EXPIRATION || 21600000); // 6 hours
            routeLink = 'confirm_email';
            subject = 'Confirme seu registro no New SAVIC';
            titulo = 'Confirme seu registro no New SAVIC';
            body_message = `<p>Para ter acesso liberado ao <b>New SAVIC da RCC Brasil</b>,
            <br>por favor, confirme seu e-mail através do link abaixo:</p>
            <p><b>Este link vai expirar em ${Math.round(expiresAt/3600000)} horas.</b></p>`
        } else {
            // reset_password
            let resetExpiration = Number(process.env.RESET_EXPIRATION || 1800000);
            expiresAt = Date.now() + resetExpiration; // 30 min
            routeLink = 'reset_password';
            subject = 'Redefina sua senha no New SAVIC';
            titulo = 'Redefinir senha - New SAVIC'
            body_message = `<p>Para redefinir sua senha no <b>New SAVIC da RCC Brasil</b>,
            <br>por favor, utilize o link abaixo:</p>
            <p><b>Este link vai expirar em ${Math.round(resetExpiration/3600000*60)} minutos.</b></p>`
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.AUTH_EMAIL,
              pass: process.env.AUTH_PASS,
            }
        });
        const uniqueString = uuidv4() + userId;
        const confirmationLink = `http://localhost:8000/${routeLink}/${userId}/${uniqueString}`;
        const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: subject,
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
                <h1>${titulo}</h1>
                ${body_message}
                <p><a href="${confirmationLink}">Confirme aqui</a></p><br>
                <p><b>Se tiver problemas com o botão acima, 
                <br>copie e cole o link abaixo no seu navegador:</b></p>
                ${confirmationLink}
            </div>
            </body>
        </html>`
        };    
        const createdAt = Date.now();
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
                                console.log(confirmationLink);
                            }
                        }
                    });     
                }
            });
        } else {
            console.log('sendConfirmationEmail can not save userVerification data');
            let message = "Ocorreu um problema ao acessar sua verificação de email.";
            res.redirect(`/user_message/?error=true&message=${message}`);
        }
          
    } catch (error) {
        console.log('sendConfirmationEmail', error);
    }
};

function handleEmailConfirmationVerified(req, res){
    res.sendFile(path.join(__dirname, "../../views/user_message.html"));
}

function handleEmailConfirmationError(req, res, message){
    const redirectUrl = '/user_message' + message;
    res.redirect(redirectUrl);
}

// Function to handle user confirmation, 
// it returns the confirmation email from:
// user register || update user email 
async function handleRegisterOrUpdateEmailConfirmation(req, res) {
    await handleEmailConfirmation(req, res, 'register_or_update_email');
}

// Function to handle user confirmation, 
// it returns the confirmation email from:
// forgot password 
async function handleForgotPasswordConfirmation(req, res) {
    await handleEmailConfirmation(req, res, 'forgot_password');
}
async function handleEmailConfirmation(req, res, goal) {
    try {
        let {id, uniqueString} = req.params;
        let messageQueryString = "";
        if (isNaN(id)){
            messageQueryString = `?error=true&message=Problemas na id. 
            <br>Por favor, verifique novamente o link enviado.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else {
            const verificationData = await getUserVerificationById(id);
            if (verificationData.length) {
                const { expires_at } = verificationData[0];
                const hashedUniqueString = verificationData[0].unique_string;
                if (expires_at < Date.now()){
                    // The verification record is not necessary any more, 
                    // also should be deleted to avoid using the same link again
                    deleteUserVerification(verificationData[0].id);
                    messageQueryString = `?error=true&message=
                    O prazo para confirmação do email expirou. 
                    <br>Para receber um novo email, <br>utilize a opção [esqueci minha senha]`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                } else {
                    const match = await bcrypt.compare(uniqueString, hashedUniqueString);
                    if (match){
                        if (goal==='register_or_update_email'){
                            const updatedUser = await confirmUser(id);
                            if (updatedUser.length){
                                // The verification record is not necessary any more, 
                                // also should be deleted to avoid using the same link again
                                deleteUserVerification(verificationData[0].id);
                                messageQueryString = `?error=false&message=
                                Seu email foi verificado com sucesso.
                                <br><br>Você já pode acessar o New SAVIC!`;
                                handleEmailConfirmationError(req, res, messageQueryString);
                            } else {
                                messageQueryString = `?error=true&message=
                                <p>Não foi possível alterar o registro de confirmação do email do usuário.
                                <br>Por favor, tente iniciar a sessão no New SAVIC ou registrar-se novamente.`;
                                handleEmailConfirmationError(req, res, messageQueryString);                                
                            }                        
                        } else {
                            // forgot_password
                            res.render(path.join(__dirname, "../../views/reset_password"), {email: verificationData[0].email});
                        }
                    } else {                    
                        messageQueryString = `?error=true&message=
                        Problema nas chaves de segurança. 
                        <br>Por favor, confira o link de verificação novamente.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    }
                }
            } else {
                messageQueryString = `?error=true&message=
                A conta vinculada a essa verificação não existe ou o processo já foi realizado anteriormente.
                <br>Por favor, tente iniciar a sessão no New SAVIC ou reinicie o processo.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
        }
    } catch (error) {
        messageQueryString = `?error=true&message=
        Falha ao confirmar usuário.
        <br>Por favor, confira o link de verificação ou reinicie o processo`;
        handleEmailConfirmationError(req, res, messageQueryString);
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
                        await sendConfirmationEmail(email, updatedUser[0].id,'update_user_email');
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
        let messageQueryString = "";
        if (email == ""){
            messageQueryString = `?error=true&message=
            Email inválido.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (!checkEmail(email)){
            messageQueryString = `?error=true&message=
            Email inválido.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else {
            const recoveredUser = await getUserByKey({ email: email });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
                Email inválido.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            } else {
                const loginData = {
                    email: email,
                    action: 'reset_password'
                };
                const login = await signinUser(loginData, bcrypt, saltRounds) || [];
                if (login.length){
                    // Create a one time link valid for 30 minutes (inside sendConfirmationEmail() )
                    // Send confirmation email
                    sendConfirmationEmail(email, recoveredUser[0].id, 'reset_password');                    
                    messageQueryString = `?error=false&message=
                    O link para redefinir a senha foi enviado para o seu email.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                } else {
                    messageQueryString = `?error=true&message=
                    Não foi possível localizar o usuário.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                }
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

// not used anymore switched to handleForgotPasswordConfirmation
async function httpResetPassword(req, res, next){
    try {
        const { id, token } = req.params;
        let messageQueryString = ""
        if (id == "" || token == ""){
            messageQueryString = `?error=true&message=
            Parametros inválidos.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (isNaN(Number(id))){
            messageQueryString = `?error=true&message=
            Formato id inválido.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else {
            const recoveredUser = await getUserByKey({ id });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
                Id inválida.`;
                handleEmailConfirmationError(req, res, messageQueryString);
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
                            messageQueryString = `?error=true&message=
                            O link de redefinição de senha expirou. Por favor, solicite um novo link.`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                        } else if (error.name === 'JsonWebTokenError') {
                            messageQueryString = `?error=true&message=
                            O link de redefinição de senha é inválido. 
                            <br>Verifique se o link está correto ou solicite um novo link.`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                        } else {
                            console.log(error.message);
                            messageQueryString = `?error=true&message=
                            Não foi possível localizar o usuário.`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                        }
                    }
                } else {
                    messageQueryString = `?error=true&message=
                    Não foi possível localizar o usuário.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                }    
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

async function httpPostResetPassword(req, res, next){
    try {
        let {id, uniqueString} = req.params;
        const { password, password2 } = req.body;
        let messageQueryString = "";
        if (id == "" || uniqueString == ""){
            messageQueryString = `?error=true&message=
            Parametros inválidos.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (isNaN(Number(id))){
            messageQueryString = `?error=true&message=
            Formato id inválido.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (password.length < passwordSize){
            messageQueryString = `?error=true&message=
            Senha deve ter ao menos ${ passwordSize } caracteres.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (password !== password2){
            messageQueryString = `?error=true&message=
            Senha definida e senha confirmada são diferentes.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        }else {    
            const recoveredUser = await getUserByKey({ id });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
                Id inválida.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            } else {
                const loginData = {
                    email: recoveredUser[0].email,
                    action: 'reset_password'
                };
                const login = await signinUser(loginData, bcrypt, saltRounds) || [];
                if (login.length){
                    // // Create a one time link valid for 30 minutes
                    // This link is one time valid
                    const newPassword = bcrypt.hashSync(password, saltRounds);
                    const loginData = { 
                        email: recoveredUser[0].email,
                        password: newPassword
                    };
                    const resetedPassword = await resetLoginPassword(loginData, bcrypt, saltRounds);
                    if (!resetedPassword.email){
                        messageQueryString = `?error=true&message=
                        Não foi possível atualizar o email. <br>
                        Verifique se informou a nova senha corretamente ou tente redefinir novamente.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    } else {
                        // Just in case the user had registered 
                        // but before confirm his email has requested
                        // reset password
                        const updatedUser = await confirmUser(id);
                        // The verification record is not necessary any more, 
                        // also should be deleted to avoid using the same link again
                        deleteUserVerification(recoveredUser[0].id);
                        messageQueryString = `?error=false&message=
                        Senha redefinida com sucesso para ${ resetedPassword.email }. <br>
                        Você já pode se conectar com a nova senha.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
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
    handleRegisterOrUpdateEmailConfirmation,
    httpUpdateUserEmail,
    handleEmailConfirmationVerified,
    handleEmailConfirmationError,
    httpRenderForgotPassword, 
    httpPostForgotPassword,
    httpResetPassword,
    httpPostResetPassword,
    handleForgotPasswordConfirmation
};