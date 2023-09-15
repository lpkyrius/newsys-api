import express, { Request, Response }  from 'express';

import { 
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
    resetLoginPassword,
    deleteUser
} from '../../models/users.model';

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

async function handleSignin(req: Request, res: Response) {

    try {

        let {email, password } = req.body;

        // data validation: right email/password format avoiding SQL Injection...
        if (email == "" || password == ""){
            res.status(400).json({ error: 'Invalid data.' });
        } else if (password.length < passwordSize){
            res.status(400).json({ error: `Password should contain at least ${ passwordSize } characters.` });
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'Invalid email.' });
        } else {
            const loginData = {
                email: email, 
                password: password,
                action: 'signin'
            };
            const user = await signinUser(loginData, bcrypt, saltRounds) || [];
            if (user.id){
                if (!user.verified){
                    res.status(400).json({ error: 'this email has not been verified yet, verify your inbox' });
                } else {
                    res.status(200).json(user);
                }
            } else {
                res.status(400).json({ error: 'invalid user or password'});
            }
        }

    } catch (error) {
        res.status(500).json({ error: 'error during login attempt' });
    }
}

function formatCPF(cpf: string) {

    // let's keep only the numbers
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.slice(0,11);
}


async function handleRegister(req: Request, res: Response) {

    try {

        let {email, name, cpf, password } = req.body;
        const created_at = new Date();
        
        // data validation
        email = email.slice(0,100);
        name = name.slice(0,100);
        cpf = formatCPF(cpf); 
        if (email == "" || name == "" || cpf == "" || password == ""){
            res.status(400).json({ error: 'Invalid data' });
        } else if (!checkUserName(name)){
            res.status(400).json({ error: 'invalid name' });
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'Invalid email' });
        } else if (password.length < passwordSize){
            res.status(400).json({ error: `Password should contain at least ${ passwordSize } characters.` });
        } else if (!CheckCPF(cpf)){
            res.status(400).json({ error: 'invalid cpf' });
        } else if (await checkCpfExists(cpf)){
            res.status(409).json({ error: 'cpf already in use, try to log in ou reset your password' });
        } else if (await checkEmailExists(email)){
            res.status(409).json({ error: 'email already in use, try to log in ou reset your password' });
        } else {
            password = bcrypt.hashSync(password, saltRounds);
            const userData = { email, name, cpf, created_at, password };
            const registeredUser = await registerUser(userData);
            // Send confirmation email
            sendConfirmationEmail(req, res, email, registeredUser[0].id, 'register');
            res.status(201).json(registeredUser[0]);
        }
        
    } catch (error) {
        res.status(500).json({ error: 'error during user registration.' });
    }
}

// Function to send confirmation email when a new user sign on
const sendConfirmationEmail = async (req: Request, res: Response, email: string, userId: number, goal: string) => {
    
    try {

        let expiresAt = 0;
        let resetExpiration = 0;
        let routeLink = '';
        let subject = '';
        let titulo = '';
        let body_message ='';

        if (goal==='register' || goal === 'update-user-email'){
            resetExpiration = Number(process.env.EMAIL_EXPIRATION || 21600000);
            expiresAt = Date.now() + resetExpiration; // 6 hours
            routeLink = 'users/confirm-email';
            subject = 'Confirm your registration';
            titulo = 'Confirm your registration';
            body_message = `<p>You are almost there!<b>NewSYS access.</b>,
            <br>To confirm your registration please clink on the link below:</p>
            <p><b>This link will expire within ${Math.round(resetExpiration/3600000)} hours.</b></p>`
        } else {
            // reset-password
            resetExpiration = Number(process.env.RESET_EXPIRATION || 1800000);
            expiresAt = Date.now() + resetExpiration; // 30 min
            routeLink = 'users/reset-password';
            subject = 'Reset your password';
            titulo = 'Reset your password'
            body_message = `<p>To reset your password on <b>NewSYS access</b>,
            <br>please clink on the link below:</p>
            <p><b>This link will expire within ${Math.round(resetExpiration/3600000*60)} minutes.</b></p>`
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
                <p><b>If you can't use the button above, 
                <br>copy and paste the link below into your browser:</b></p>
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
                                console.log('email sent: ' + info.response);
                                console.log(confirmationLink);
                            }
                        }
                    });     
                }
            });
        } else {
            console.log('sendConfirmationEmail can not save userVerification data');
            let message = "error accessing user verification";
            res.redirect(`/users/user-message/?error=true&message=${message}`);
        }
          
    } catch (error) {
        console.log('sendConfirmationEmail', error);
    }
};

function handleEmailConfirmationVerified(req: Request, res: Response){
    res.sendFile(path.join(__dirname, "../../views/user-message.html"));
}

function handleEmailConfirmationError(req: Request, res: Response, message: string){
    const redirectUrl = '/users/user-message' + message;
    res.redirect(redirectUrl);
}

// Function to handle user confirmation, 
// it returns the confirmation email from:
// user register || update user email 
async function handleRegisterOrUpdateEmailConfirmation(req: Request, res: Response) {
    await handleEmailConfirmation(req, res, 'register_or_update_email');
}

// Function to handle user confirmation, 
// it returns the confirmation email from:
// forgot password 
async function handleForgotPasswordConfirmation(req: Request, res: Response) {
    await handleEmailConfirmation(req, res, 'forgot-password');
}

async function handleEmailConfirmation(req: Request, res: Response, goal: string) {

    let messageQueryString = "";

    try {

        const uniqueString = req.params.uniqueString;
        const id: number = parseInt(req.params.id);

        if (isNaN(id)){
            messageQueryString = `?error=true&message=Invalid id. 
            <br>Please verify the link sent.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else {
            const verificationData = await getUserVerificationById(id);
            if (verificationData.length) {
                const { expires_at } = verificationData[0];
                const hashedUniqueString = verificationData[0].unique_string;
                if (expires_at < Date.now()){
                    // The verification record is not necessary any more, 
                    // also should be deleted to avoid using the same link again
                    deleteUserVerification(verificationData[0].user_id);
                    messageQueryString = `?error=true&message=
                    Your confirmation email message has expired. 
                    <br>To receive a new message, <br>use [forgot password?]`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                } else {
                    const match = await bcrypt.compare(uniqueString, hashedUniqueString);
                    if (match){
                        if (goal==='register_or_update_email'){
                            const updatedUser = await confirmUser(id);
                            if (updatedUser.length){
                                // The verification record is not necessary any more, 
                                // also should be deleted to avoid using the same link again
                                deleteUserVerification(verificationData[0].user_id);
                                messageQueryString = `?error=false&message=
                                Your email has been successfully verified.
                                <br><br>You can log in to the application now!`;
                                handleEmailConfirmationError(req, res, messageQueryString);
                            } else {
                                messageQueryString = `?error=true&message=
                                <p>Error while attempting to update the user confirmation.
                                <br>Please, try to log in or register again.`;
                                handleEmailConfirmationError(req, res, messageQueryString);                                
                            }                        
                        } else {
                            // forgot-password
                            res.render(path.join(__dirname, "../../views/reset-password"), {email: verificationData[0].email});
                        }
                    } else {                    
                        messageQueryString = `?error=true&message=
                        Error on security keys. 
                        <br>Please, verify the link.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    }
                }
            } else {
                messageQueryString = `?error=true&message=
                The account related to this confirmation doesn't exist or this process has already been done.
                <br>Please, try to log in or start the process again.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
        }
        
    } catch (error) {
        messageQueryString = `?error=true&message=
        Error attempting to confirm your email.
        <br>Please, verify the link or start the process again`;
        handleEmailConfirmationError(req, res, messageQueryString);
    }
}

async function httpGetAllUsers(req: Request, res: Response) {
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

async function httpGetUser(req: Request, res: Response) {
    try {
        const key = req.params;
        // Validation
        if (isNaN(Number(key.id))){
            return res.status(400).json({ error: 'the ID must be a number'});
        }
        const recoveredUser = await getUserByKey(key);
        if (recoveredUser.length) {
            res.status(200).json(recoveredUser[0]);
        } else {
            res.status(400).json({ error: 'user not found' });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'error attempting to access the user' });
    }
}

async function httpUpdateUser(req: Request, res: Response) {
    try {

        const userId = req.params.id;
        let { name, cpf } = req.body; 

        // Validation
        name = name.slice(0,100);
        cpf = formatCPF(cpf);  
        if (isNaN(Number(userId))){
            res.status(400).json({ error: 'the ID must be a number'});
        } else if (!checkUserName(name)){
            res.status(400).json({ error: 'invalid name' });
        } else if (!CheckCPF(cpf)){
            res.status(400).json({ error: 'invalid cpf' });
        } else if (await checkCpfAlreadyUsed(userId,cpf)){
            res.status(409).json({ error: 'cpf already in use' });
        } else {
            const userData = { name, cpf };
            const updatedUser = await updateUser(userId, userData);
            if (updatedUser.length) {
                res.status(200).json(updatedUser[0]);
            } else {
                res.status(404).json({ error: 'user not found' });
            }
        }
    } catch (error) {
        console.log('httpUpdateUser', error);
        res.status(500).json({error: 'error attempting to update the user'});
    }   
}

async function handleUserDelete(req: Request, res: Response) {
    try {

        const userId = req.params.id;

        // Validation 
        if (isNaN(Number(userId))){
            res.status(400).json({ error: 'the ID must be a number'});
        } else {
            const deletedUserInfo = await deleteUser(userId);
            if (deletedUserInfo) {
                res.status(200).json({ message: `User id ${ deletedUserInfo.id } successfully deleted!`});
            } else {
                res.status(404).json({ error: 'user not found' });
            }
        }
    } catch (error) {
        console.log('handleUserDelete', error);
        res.status(500).json({error: 'error attempting to delete the user'});
    }   
}

async function httpUpdateUserEmail(req: Request, res: Response) {
    try {

        const userId = req.params.id;
        let { email } = req.body;
        
        // Validation
        if (isNaN(Number(userId))){
            res.status(400).json({ error: 'the ID must be a number'});
        } else if (!checkEmail(email)){
            res.status(400).json({ error: 'invalid email.' });
        } else if (await checkEmailAlreadyUsed(userId,email)){
            res.status(409).json({ error: 'email already in use' });
        } else {
            const recoveredUser = await getUserByKey({ id: userId});
            if (!recoveredUser.length) {
                res.status(404).json({ error: 'user not found' });
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
                        await sendConfirmationEmail(req, res, email, updatedUser[0].id,'update-user-email');
                        res.status(200).json(updatedUser[0]);
                    } else {
                        res.status(400).json({ error: 'error attempting to update the email' });
                    }
                }
            }
        }
    } catch (error) {
        console.log('httpUpdateUserEmail', error);
        res.status(500).json({error: 'error attempting to update the email'});
    }   
}

// Block of validation functions
function checkUserName(name: string) {
    // The number of characters must be between 3 and 100. 
    // The string should only contain alphanumeric characters and/or underscores (_).
    // The first character of the string should be alphabetic
    if(/^[A-Za-z\s]{3,100}$/.test(name)) {
        return true; // valid
    } else {
        return false; // invalid
    }
}

function checkEmail(email: string) {
    if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return false; // invalid
    } else if (email.length < 3 || email.length > 100){
        return false; // invalid
    } else {
        return true; // valid
    }
}

async function checkEmailExists(email: string){
    const key = { email: email }
    const exists = await getUserByKey(key);
    if (exists.length){
        return true;
    } else {
        return false;
    }
}

async function checkCpfExists(cpf: string){
    const key = { cpf: cpf }
    const exists = await getUserByKey(key);
    if (exists.length){
        return true;
    } else {
        return false;
    }
}

async function checkCpfAlreadyUsed(id: string | number, cpf: string){

    const idSearch = { id: id };
    const keySearch = { cpf: cpf };
    const exists = await getKeyAlreadyUsedByAnotherId(idSearch, keySearch);

    if (exists.length){
        return true;
    } else {
        return false;
    }
}

async function checkEmailAlreadyUsed(id: string | number, email: string){

    const idSearch = { id: id };
    const keySearch = { email: email };
    const exists = await getKeyAlreadyUsedByAnotherId(idSearch, keySearch);

    if (exists.length){
        return true;
    } else {
        return false;
    }
}

function CheckCPF(strCPF: string) {

    let Soma: number;
    let Resto: number;
    let validaKey: boolean = ((process.env.CPF_VALIDATION || "1") == "1") ? true : false;
    let i: number = 1;

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

async function httpRenderForgotPassword(req: Request, res: Response){
    res.render(path.join(__dirname, "../../views/forgot-password"));
}

async function httpPostForgotPassword(req: Request, res: Response){
    try {
        
        const { email } = req.body;
        let messageQueryString: string = "";

        if (email == ""){
            messageQueryString = `?error=true&message=
            Invalid email.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (!checkEmail(email)){
            messageQueryString = `?error=true&message=
            Invalid email.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else {
            const recoveredUser = await getUserByKey({ email: email });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
                Invalid email.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            } else {
                const loginData = {
                    email: email,
                    action: 'reset-password'
                };
                const login = await signinUser(loginData, bcrypt, saltRounds) || [];
                if (login.length){
                    // Create a one time link valid for 30 minutes (inside sendConfirmationEmail() )
                    // Send confirmation email
                    sendConfirmationEmail(req, res, email, recoveredUser[0].id, 'reset-password');                    
                    messageQueryString = `?error=false&message=
                    The link to reset your password has been sent to your email.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                } else {
                    messageQueryString = `?error=true&message=
                    User not found.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                }
            }
        }
    } catch (error) {
        console.log('httpPostForgotPassword', error);
        res.status(500).json({error: 'error attempting to reset password'});
    }
}

async function httpPostResetPassword(req: Request, res: Response){
    try {

        let {id, uniqueString} = req.params;
        const { password, password2 } = req.body;
        let messageQueryString: string = "";

        if (id == "" || uniqueString == ""){
            messageQueryString = `?error=true&message=
            Invalid parameters.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (isNaN(Number(id))){
            messageQueryString = `?error=true&message=
            Invalid ID.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (password.length < passwordSize){
            messageQueryString = `?error=true&message=
            Password must contain at least ${ passwordSize } characters.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else if (password !== password2){
            messageQueryString = `?error=true&message=
            Password and confirmation password do not match.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        } else {    
            const recoveredUser = await getUserByKey({ id });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
                Invalid ID.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            } else {
                const loginData = {
                    email: recoveredUser[0].email,
                    action: 'reset-password'
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
                        Error attempting to update your email. <br>
                        Please, review your data and try again.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    } else {
                        // Just in case the user had registered 
                        // but before confirm his email has requested
                        // reset password - it also update users.updated_at field
                        const updatedUser = await confirmUser(id);
                        // The verification record is not necessary any more, 
                        // also should be deleted to avoid using the same link again
                        deleteUserVerification(recoveredUser[0].id);
                        messageQueryString = `?error=false&message=
                        New password defined successfully for ${ resetedPassword.email }. <br>
                        You can log in now.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                    }                      
                }
            }            
        }
    } catch (error) {
        console.log('httpPostResetPassword', error);
        res.status(500).json({error: 'error attempting to reset password'});
    }
}

export {
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
    httpPostResetPassword,
    handleForgotPasswordConfirmation,
    handleUserDelete
};