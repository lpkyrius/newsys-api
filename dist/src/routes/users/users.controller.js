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
exports.handleForgotPasswordConfirmation = exports.httpPostResetPassword = exports.httpPostForgotPassword = exports.httpRenderForgotPassword = exports.handleEmailConfirmationError = exports.handleEmailConfirmationVerified = exports.httpUpdateUserEmail = exports.handleRegisterOrUpdateEmailConfirmation = exports.httpUpdateUser = exports.httpGetUser = exports.httpGetAllUsers = exports.handleRegister = exports.handleSignin = void 0;
const users_model_1 = require("../../models/users.model");
const passwordSize = Number(process.env.PASSWORD_MIN_SIZE || 8);
// hash handler
const bcrypt = require('bcrypt');
const saltRounds = 10;
// email handler
const nodemailer = require('nodemailer');
// unique string 
const { v4: uuidv4 } = require('uuid');
// env variables
require('dotenv').config();
// path for static verified page
const path = require("path");
// web token
const jwt = require('jsonwebtoken');
function handleSignin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { email, password } = req.body;
            // data validation: right email/password format avoiding SQL Injection...
            if (email == "" || password == "") {
                res.status(400).json({ error: 'Dados inválidos.' });
            }
            else if (password.length < passwordSize) {
                res.status(400).json({ error: `Senha deve ter ao menos ${passwordSize} caracteres.` });
            }
            else if (!checkEmail(email)) {
                res.status(400).json({ error: 'Email inválido.' });
            }
            else {
                const loginData = {
                    email: email,
                    password: password,
                    action: 'signin'
                };
                const user = (yield (0, users_model_1.signinUser)(loginData, bcrypt, saltRounds)) || [];
                if (user.id) {
                    if (!user.verified) {
                        res.status(400).json({ error: 'Usuário ainda não confirmado via email de confirmação.' });
                    }
                    else {
                        res.status(200).json(user);
                    }
                }
                else {
                    res.status(400).json({ error: 'usuário ou senha inválidos' });
                }
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Erro na tentativa de login.' });
        }
    });
}
exports.handleSignin = handleSignin;
function formatCPF(cpf) {
    // let's keep only the numbers
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.slice(0, 11);
}
function handleRegister(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { email, name, cpf, password } = req.body;
            const created_at = new Date();
            // data validation
            email = email.slice(0, 100);
            name = name.slice(0, 100);
            cpf = formatCPF(cpf);
            if (email == "" || name == "" || cpf == "" || password == "") {
                res.status(400).json({ error: 'Dados inválidos.' });
            }
            else if (!checkUserName(name)) {
                res.status(400).json({ error: 'Nome inválido.' });
            }
            else if (!checkEmail(email)) {
                res.status(400).json({ error: 'Email inválido.' });
            }
            else if (password.length < passwordSize) {
                res.status(400).json({ error: `Senha deve ter ao menos ${passwordSize} caracteres.` });
            }
            else if (!TestaCPF(cpf)) {
                res.status(400).json({ error: 'CPF inválido.' });
            }
            else if (yield checkCpfExists(cpf)) {
                res.status(400).json({ error: 'CPF já cadastrado. Tente efetuar o login ou recuperar sua senha' });
            }
            else if (yield checkEmailExists(email)) {
                res.status(400).json({ error: 'Email já cadastrado. Tente efetuar o login ou recuperar sua senha' });
            }
            else {
                password = bcrypt.hashSync(password, saltRounds);
                const userData = { email, name, cpf, created_at, password };
                const registeredUser = yield (0, users_model_1.registerUser)(userData);
                // Send confirmation email
                sendConfirmationEmail(req, res, email, registeredUser[0].id, 'register');
                res.status(201).json(registeredUser[0]);
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Falha ao registrar novo usuário.' });
        }
    });
}
exports.handleRegister = handleRegister;
// Function to send confirmation email when a new user sign on
const sendConfirmationEmail = (req, res, email, userId, goal) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let expiresAt = 0;
        let resetExpiration = 0;
        let routeLink = '';
        let subject = '';
        let titulo = '';
        let body_message = '';
        if (goal === 'register' || goal === 'update_user_email') {
            resetExpiration = Number(process.env.EMAIL_EXPIRATION || 21600000);
            expiresAt = Date.now() + resetExpiration; // 6 hours
            routeLink = 'confirm_email';
            subject = 'Confirme seu registro no New SAVIC';
            titulo = 'Confirme seu registro no New SAVIC';
            body_message = `<p>Para ter acesso liberado ao <b>New SAVIC da RCC Brasil</b>,
            <br>por favor, confirme seu e-mail através do link abaixo:</p>
            <p><b>Este link vai expirar em ${Math.round(resetExpiration / 3600000)} horas.</b></p>`;
        }
        else {
            // reset_password
            resetExpiration = Number(process.env.RESET_EXPIRATION || 1800000);
            expiresAt = Date.now() + resetExpiration; // 30 min
            routeLink = 'reset_password';
            subject = 'Redefina sua senha no New SAVIC';
            titulo = 'Redefinir senha - New SAVIC';
            body_message = `<p>Para redefinir sua senha no <b>New SAVIC da RCC Brasil</b>,
            <br>por favor, utilize o link abaixo:</p>
            <p><b>Este link vai expirar em ${Math.round(resetExpiration / 3600000 * 60)} minutos.</b></p>`;
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
        };
        const registeredVerification = yield (0, users_model_1.newUserVerification)(newVerification);
        if (registeredVerification.length) {
            transporter.verify((error, success) => {
                if (error) {
                    console.log('sendConfirmationEmail verify', error);
                }
                else {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log('sendConfirmationEmail error sending email');
                        }
                        else {
                            // turning off this console to avoid warnings messages in SuperJest automated tests
                            if (process.env.SHOW_CONSOLE_EMAIL === '1') {
                                console.log('Email enviado: ' + info.response);
                                console.log(confirmationLink);
                            }
                        }
                    });
                }
            });
        }
        else {
            console.log('sendConfirmationEmail can not save userVerification data');
            let message = "Ocorreu um problema ao acessar sua verificação de email.";
            res.redirect(`/user_message/?error=true&message=${message}`);
        }
    }
    catch (error) {
        console.log('sendConfirmationEmail', error);
    }
});
function handleEmailConfirmationVerified(req, res) {
    res.sendFile(path.join(__dirname, "../../views/user_message.html"));
}
exports.handleEmailConfirmationVerified = handleEmailConfirmationVerified;
function handleEmailConfirmationError(req, res, message) {
    const redirectUrl = '/user_message' + message;
    res.redirect(redirectUrl);
}
exports.handleEmailConfirmationError = handleEmailConfirmationError;
// Function to handle user confirmation, 
// it returns the confirmation email from:
// user register || update user email 
function handleRegisterOrUpdateEmailConfirmation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield handleEmailConfirmation(req, res, 'register_or_update_email');
    });
}
exports.handleRegisterOrUpdateEmailConfirmation = handleRegisterOrUpdateEmailConfirmation;
// Function to handle user confirmation, 
// it returns the confirmation email from:
// forgot password 
function handleForgotPasswordConfirmation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield handleEmailConfirmation(req, res, 'forgot_password');
    });
}
exports.handleForgotPasswordConfirmation = handleForgotPasswordConfirmation;
function handleEmailConfirmation(req, res, goal) {
    return __awaiter(this, void 0, void 0, function* () {
        let messageQueryString = "";
        try {
            const uniqueString = req.params.uniqueString;
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                messageQueryString = `?error=true&message=Problemas na id. 
            <br>Por favor, verifique novamente o link enviado.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else {
                const verificationData = yield (0, users_model_1.getUserVerificationById)(id);
                if (verificationData.length) {
                    const { expires_at } = verificationData[0];
                    const hashedUniqueString = verificationData[0].unique_string;
                    if (expires_at < Date.now()) {
                        // The verification record is not necessary any more, 
                        // also should be deleted to avoid using the same link again
                        (0, users_model_1.deleteUserVerification)(verificationData[0].user_id);
                        messageQueryString = `?error=true&message=
                    O prazo para confirmação do email expirou. 
                    <br>Para receber um novo email, <br>utilize a opção [esqueci minha senha]`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    }
                    else {
                        const match = yield bcrypt.compare(uniqueString, hashedUniqueString);
                        if (match) {
                            if (goal === 'register_or_update_email') {
                                const updatedUser = yield (0, users_model_1.confirmUser)(id);
                                if (updatedUser.length) {
                                    // The verification record is not necessary any more, 
                                    // also should be deleted to avoid using the same link again
                                    (0, users_model_1.deleteUserVerification)(verificationData[0].user_id);
                                    messageQueryString = `?error=false&message=
                                Seu email foi verificado com sucesso.
                                <br><br>Você já pode acessar o New SAVIC!`;
                                    handleEmailConfirmationError(req, res, messageQueryString);
                                }
                                else {
                                    messageQueryString = `?error=true&message=
                                <p>Não foi possível alterar o registro de confirmação do email do usuário.
                                <br>Por favor, tente iniciar a sessão no New SAVIC ou registrar-se novamente.`;
                                    handleEmailConfirmationError(req, res, messageQueryString);
                                }
                            }
                            else {
                                // forgot_password
                                res.render(path.join(__dirname, "../../views/reset_password"), { email: verificationData[0].email });
                            }
                        }
                        else {
                            messageQueryString = `?error=true&message=
                        Problema nas chaves de segurança. 
                        <br>Por favor, confira o link de verificação novamente.`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                        }
                    }
                }
                else {
                    messageQueryString = `?error=true&message=
                A conta vinculada a essa verificação não existe ou o processo já foi realizado anteriormente.
                <br>Por favor, tente iniciar a sessão no New SAVIC ou reinicie o processo.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                }
            }
        }
        catch (error) {
            messageQueryString = `?error=true&message=
        Falha ao confirmar usuário.
        <br>Por favor, confira o link de verificação ou reinicie o processo`;
            handleEmailConfirmationError(req, res, messageQueryString);
        }
    });
}
function httpGetAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredUsers = yield (0, users_model_1.getAllUsers)();
            if (recoveredUsers.length) {
                res.status(200).json(recoveredUsers);
            }
            else {
                res.status(400).json({ error: 'Não foi possível localizar usuários.' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Falha ao localizar usuários.' });
        }
    });
}
exports.httpGetAllUsers = httpGetAllUsers;
function httpGetUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = req.params;
            // Validation
            if (isNaN(Number(key.id))) {
                return res.status(400).json({ error: 'Id de usuário deve ser em formato numérico.' });
            }
            const recoveredUser = yield (0, users_model_1.getUserByKey)(key);
            if (recoveredUser.length) {
                res.status(200).json(recoveredUser[0]);
            }
            else {
                res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Falha ao localizar usuário.' });
        }
    });
}
exports.httpGetUser = httpGetUser;
function httpUpdateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            let { name, cpf } = req.body;
            // Validation
            name = name.slice(0, 100);
            cpf = formatCPF(cpf);
            if (isNaN(Number(userId))) {
                res.status(400).json({ error: 'Id de usuário deve ser em formato numérico.' });
            }
            else if (!checkUserName(name)) {
                res.status(400).json({ error: 'Nome inválido.' });
            }
            else if (!TestaCPF(cpf)) {
                res.status(400).json({ error: 'CPF inválido.' });
            }
            else if (yield checkCpfAlreadyUsed(userId, cpf)) {
                res.status(400).json({ error: 'CPF já cadastrado.' });
            }
            else {
                const userData = { name, cpf };
                const updatedUser = yield (0, users_model_1.updateUser)(userId, userData);
                if (updatedUser.length) {
                    res.status(200).json(updatedUser[0]);
                }
                else {
                    res.status(400).json({ error: 'Não foi possível atualizar os dados do usuário.' });
                }
            }
        }
        catch (error) {
            res.status(500).json(error);
        }
    });
}
exports.httpUpdateUser = httpUpdateUser;
function httpUpdateUserEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            let { email } = req.body;
            // Validation
            if (isNaN(Number(userId))) {
                res.status(400).json({ error: 'Id de usuário deve ser em formato numérico.' });
            }
            else if (!checkEmail(email)) {
                res.status(400).json({ error: 'Email inválido.' });
            }
            else if (yield checkEmailAlreadyUsed(userId, email)) {
                res.status(400).json({ error: 'Email já cadastrado.' });
            }
            else {
                const recoveredUser = yield (0, users_model_1.getUserByKey)({ id: userId });
                if (!recoveredUser.length) {
                    res.status(400).json({ error: 'Não foi possível localizar o usuário.' });
                }
                else {
                    const checkIfEmailChanged = yield (0, users_model_1.getUserByKey)({ id: userId });
                    // To verify if we are actually changing the email or if it's still the same
                    if (checkIfEmailChanged.length && checkIfEmailChanged[0].email == email) {
                        res.status(200).json(checkIfEmailChanged[0]);
                    }
                    else {
                        // update email and update verified=false in order to force validate the email again
                        const userData = { email: email, verified: false };
                        const updatedUser = yield (0, users_model_1.updateEmail)(userId, checkIfEmailChanged[0].email, userData);
                        if (updatedUser.length) {
                            // Send confirmation email
                            yield sendConfirmationEmail(req, res, email, updatedUser[0].id, 'update_user_email');
                            res.status(200).json(updatedUser[0]);
                        }
                        else {
                            res.status(400).json({ error: 'Não foi possível atualizar o email do usuário.' });
                        }
                    }
                }
            }
        }
        catch (error) {
            res.status(500).json(error);
        }
    });
}
exports.httpUpdateUserEmail = httpUpdateUserEmail;
// Block of validation functions
function checkUserName(name) {
    // The number of characters must be between 3 and 100. 
    // The string should only contain alphanumeric characters and/or underscores (_).
    // The first character of the string should be alphabetic
    if (/^[A-Za-z\s]{3,100}$/.test(name)) {
        return true; // valid
    }
    else {
        return false; // invalid
    }
}
function checkEmail(email) {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return false; // invalid
    }
    else if (email.length < 3 || email.length > 100) {
        return false; // invalid
    }
    else {
        return true; // valid
    }
}
function checkEmailExists(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = { email: email };
        const exists = yield (0, users_model_1.getUserByKey)(key);
        if (exists.length) {
            return true;
        }
        else {
            return false;
        }
    });
}
function checkCpfExists(cpf) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = { cpf: cpf };
        const exists = yield (0, users_model_1.getUserByKey)(key);
        if (exists.length) {
            return true;
        }
        else {
            return false;
        }
    });
}
function checkCpfAlreadyUsed(id, cpf) {
    return __awaiter(this, void 0, void 0, function* () {
        const idSearch = { id: id };
        const keySearch = { cpf: cpf };
        const exists = yield (0, users_model_1.getKeyAlreadyUsedByAnotherId)(idSearch, keySearch);
        if (exists.length) {
            return true;
        }
        else {
            return false;
        }
    });
}
function checkEmailAlreadyUsed(id, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const idSearch = { id: id };
        const keySearch = { email: email };
        const exists = yield (0, users_model_1.getKeyAlreadyUsedByAnotherId)(idSearch, keySearch);
        if (exists.length) {
            return true;
        }
        else {
            return false;
        }
    });
}
function TestaCPF(strCPF) {
    let Soma;
    let Resto;
    let validaKey = ((process.env.CPF_VALIDATION || "1") == "1") ? true : false;
    let i = 1;
    if (!validaKey) {
        return true; // validation has been turned off.
    }
    else {
        Soma = 0;
        if (strCPF == "00000000000")
            return false;
        for (i = 1; i <= 9; i++)
            Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;
        if ((Resto == 10) || (Resto == 11))
            Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10)))
            return false;
        Soma = 0;
        for (i = 1; i <= 10; i++)
            Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;
        if ((Resto == 10) || (Resto == 11))
            Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11)))
            return false;
        return true;
    }
}
function httpRenderForgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render(path.join(__dirname, "../../views/forgot_password"));
    });
}
exports.httpRenderForgotPassword = httpRenderForgotPassword;
function httpPostForgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            let messageQueryString = "";
            if (email == "") {
                messageQueryString = `?error=true&message=
            Email inválido.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else if (!checkEmail(email)) {
                messageQueryString = `?error=true&message=
            Email inválido.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else {
                const recoveredUser = yield (0, users_model_1.getUserByKey)({ email: email });
                if (!recoveredUser.length) {
                    messageQueryString = `?error=true&message=
                Email inválido.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                }
                else {
                    const loginData = {
                        email: email,
                        action: 'reset_password'
                    };
                    const login = (yield (0, users_model_1.signinUser)(loginData, bcrypt, saltRounds)) || [];
                    if (login.length) {
                        // Create a one time link valid for 30 minutes (inside sendConfirmationEmail() )
                        // Send confirmation email
                        sendConfirmationEmail(req, res, email, recoveredUser[0].id, 'reset_password');
                        messageQueryString = `?error=false&message=
                    O link para redefinir a senha foi enviado para o seu email.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    }
                    else {
                        messageQueryString = `?error=true&message=
                    Não foi possível localizar o usuário.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    }
                }
            }
        }
        catch (error) {
            res.status(500).json(error);
        }
    });
}
exports.httpPostForgotPassword = httpPostForgotPassword;
function httpPostResetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { id, uniqueString } = req.params;
            const { password, password2 } = req.body;
            let messageQueryString = "";
            if (id == "" || uniqueString == "") {
                messageQueryString = `?error=true&message=
            Parametros inválidos.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else if (isNaN(Number(id))) {
                messageQueryString = `?error=true&message=
            Formato id inválido.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else if (password.length < passwordSize) {
                messageQueryString = `?error=true&message=
            Senha deve ter ao menos ${passwordSize} caracteres.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else if (password !== password2) {
                messageQueryString = `?error=true&message=
            Senha definida e senha confirmada são diferentes.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
            else {
                const recoveredUser = yield (0, users_model_1.getUserByKey)({ id });
                if (!recoveredUser.length) {
                    messageQueryString = `?error=true&message=
                Id inválida.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                }
                else {
                    const loginData = {
                        email: recoveredUser[0].email,
                        action: 'reset_password'
                    };
                    const login = (yield (0, users_model_1.signinUser)(loginData, bcrypt, saltRounds)) || [];
                    if (login.length) {
                        // // Create a one time link valid for 30 minutes
                        // This link is one time valid
                        const newPassword = bcrypt.hashSync(password, saltRounds);
                        const loginData = {
                            email: recoveredUser[0].email,
                            password: newPassword
                        };
                        const resetedPassword = yield (0, users_model_1.resetLoginPassword)(loginData, bcrypt, saltRounds);
                        if (!resetedPassword.email) {
                            messageQueryString = `?error=true&message=
                        Não foi possível atualizar o email. <br>
                        Verifique se informou a nova senha corretamente ou tente redefinir novamente.`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                        }
                        else {
                            // Just in case the user had registered 
                            // but before confirm his email has requested
                            // reset password - it also update users.updated_at field
                            const updatedUser = yield (0, users_model_1.confirmUser)(id);
                            // The verification record is not necessary any more, 
                            // also should be deleted to avoid using the same link again
                            (0, users_model_1.deleteUserVerification)(recoveredUser[0].id);
                            messageQueryString = `?error=false&message=
                        Senha redefinida com sucesso para ${resetedPassword.email}. <br>
                        Você já pode se conectar com a nova senha.`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                        }
                    }
                }
            }
        }
        catch (error) {
            res.status(500).json(error);
        }
    });
}
exports.httpPostResetPassword = httpPostResetPassword;
