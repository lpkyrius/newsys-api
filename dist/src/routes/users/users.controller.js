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
exports.handleUserDelete = exports.handleForgotPasswordConfirmationReturn = exports.postResetPassword = exports.postForgotPasswordEmail = exports.renderForgotPasswordPage = exports.handleEmailConfirmationError = exports.handleEmailConfirmationVerified = exports.httpUpdateUserEmail = exports.handleRegisterOrUpdateEmailConfirmation = exports.httpUpdateUser = exports.httpGetUser = exports.listAllUsers = exports.handleRegister = exports.handleLogout = exports.handleRefreshToken = exports.handleLogin = void 0;
const users_model_1 = require("../../models/users.model");
const passwordSize = Number(process.env.PASSWORD_MIN_SIZE || 8);
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const path = require("path"); // path for static verified page
const jwt = require('jsonwebtoken');
function handleLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { email, password } = req.body;
            // data validation: right email/password format avoiding SQL Injection...
            if (!validateEmail(email))
                return res.status(400).json({ error: 'Invalid data.' });
            if (!checkPassword(password))
                return res.status(400).json({ error: `Password should contain at least ${passwordSize} characters.` });
            const loginData = {
                email: email,
                password: password,
                action: 'signin'
            };
            const user = (yield (0, users_model_1.signinUser)(loginData, bcrypt, saltRounds)) || [];
            if (user.id) {
                if (!user.verified)
                    return res.status(400).json({ error: 'this email has not been verified yet, verify your inbox' });
                const accessToken = jwt.sign({ "user_id": user.id.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
                const refreshToken = jwt.sign({ "user_id": user.id.toString() }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
                yield (0, users_model_1.saveCurrentUserRefreshToken)(user.id, refreshToken);
                res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
                return res.status(200).json({ accessToken, user });
            }
            return res.status(400).json({ error: 'invalid user or password' });
        }
        catch (error) {
            console.error(`handleLogin Error-> ${error}`);
            return res.status(500).json({ error: 'error during login attempt' });
        }
    });
}
exports.handleLogin = handleLogin;
function handleRefreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`debug refresh token`);
            const cookies = req.cookies;
            if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
                return res.status(401).json({ error: 'Unauthorized.' });
            const refreshToken = cookies.jwt;
            const foundUser = (yield (0, users_model_1.getCurrentUserRefreshToken)(refreshToken)) || [];
            if (!foundUser)
                return res.status(403).json({ error: 'Forbidden.' });
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err)
                    return res.status(403).json({ error: 'Forbidden.' }); // invalid token
                const accessToken = jwt.sign({ "user_id": decoded.user_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                res.json({ accessToken });
            });
        }
        catch (error) {
            console.error(`handleRefreshToken Error-> ${error}`);
            res.status(500).json({ error: 'error during handleRefreshToken attempt' });
        }
    });
}
exports.handleRefreshToken = handleRefreshToken;
function handleLogout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // on client (FE) also deletes the accessToken
        try {
            const cookies = req.cookies;
            if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
                return res.status(204).json({ message: 'Successful. No content' });
            const refreshToken = cookies.jwt;
            const foundUser = yield (0, users_model_1.getCurrentUserRefreshToken)(refreshToken || []);
            if (!foundUser) {
                res.clearCookie('jwt', { httpOnly: true });
                return res.status(204).json({ message: 'Successful. No content' });
            }
            const currentUser = (yield (0, users_model_1.deleteCurrentUserRefreshToken)(refreshToken)) || [];
            if (!currentUser)
                return res.status(204).json({ message: 'Successful. No content' });
            // res.clearCookie('jwt', { httpOnly: true, secure: true }); // option only for production where we use https
            res.clearCookie('jwt', { httpOnly: true });
            res.status(204).json({ message: 'Successful. No content' });
        }
        catch (error) {
            console.error(`handleLogout Error-> ${error}`);
            res.status(500).json({ error: 'error during handleLogout attempt' });
        }
    });
}
exports.handleLogout = handleLogout;
function handleRegister(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { email, name, cpf, password } = req.body;
            const created_at = new Date();
            // data validation
            email = email.slice(0, 100);
            name = name.slice(0, 100);
            cpf = formatCPF(cpf);
            if (!checkUserName(name))
                return res.status(400).json({ error: 'invalid name' });
            if (!checkEmail(email))
                return res.status(400).json({ error: 'Invalid email' });
            if (!checkPassword(password))
                return res.status(400).json({ error: `Password should contain at least ${passwordSize} characters.` });
            if (!CheckCPF(cpf))
                return res.status(400).json({ error: 'invalid cpf' });
            if (yield checkCpfExists(cpf))
                return res.status(409).json({ error: 'cpf already in use, try to log in ou reset your password' });
            if (yield checkEmailExists(email))
                return res.status(409).json({ error: 'email already in use, try to log in ou reset your password' });
            password = bcrypt.hashSync(password, saltRounds);
            const userData = { email, name, cpf, created_at, password };
            const registeredUser = yield (0, users_model_1.registerUser)(userData);
            sendConfirmationEmail(req, res, email, registeredUser[0].id, 'register');
            return res.status(201).json(registeredUser[0]);
        }
        catch (error) {
            console.error(`handleRegister Error-> ${error}`);
            res.status(500).json({ error: 'error during user registration.' });
        }
    });
}
exports.handleRegister = handleRegister;
// Send confirmation email when a new user sign on
const sendConfirmationEmail = (req, res, email, userId, goal) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let expiresAt = 0;
        let resetExpiration = 0;
        let routeLink = '';
        let subject = '';
        let title = '';
        let body_message = '';
        if (goal === 'register' || goal === 'update-user-email') {
            resetExpiration = Number(process.env.EMAIL_EXPIRATION || 21600000);
            expiresAt = Date.now() + resetExpiration; // 6 hours
            routeLink = 'users/confirm-email';
            subject = 'Confirm your registration';
            title = 'Confirm your registration';
            body_message = `<b>NewSYS access: </b><p>You are almost there!
            <br>To confirm your registration please click on the link below</p>
            <p><b>This link will expire within ${Math.round(resetExpiration / 3600000)} hours.</b></p>`;
        }
        else {
            // reset-password
            resetExpiration = Number(process.env.RESET_EXPIRATION || 1800000);
            expiresAt = Date.now() + resetExpiration; // 30 min
            routeLink = 'users/reset-password';
            subject = 'Reset your password';
            title = 'Reset your password';
            body_message = `<p>To reset your password on <b>NewSYS access</b>,
            <br>please click on the link below:</p>
            <p><b>This link will expire within ${Math.round(resetExpiration / 3600000 * 60)} minutes.</b></p>`;
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
                a.button {
                color: #ffffff; /* Set the font color to white */
                background-color: #004d84;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                }
                a.button:hover {
                background-color: #1867e7;
                }
            </style>
            </head>
            <body>
            <div class="container" align="center">
                <h1>${title}</h1>
                ${body_message}
                <p><a class="button" href="${confirmationLink}">Confirm Here</a></p><br>
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
                                console.log('email sent: ' + info.response);
                                console.log(confirmationLink);
                            }
                        }
                    });
                }
            });
        }
        else {
            console.log('sendConfirmationEmail can not save userVerification data');
            let message = "error accessing user verification";
            res.redirect(`/users/user-message/?error=true&message=${message}`);
        }
    }
    catch (error) {
        console.log('sendConfirmationEmail', error);
    }
});
function handleEmailConfirmationVerified(req, res) {
    // console.log('debug >>>> .resolve()', path.resolve('./'));
    res.sendFile(path.join(__dirname, "../../../dist/src/views/user-message.html"));
}
exports.handleEmailConfirmationVerified = handleEmailConfirmationVerified;
function handleEmailConfirmationError(req, res, message) {
    const redirectUrl = '/users/user-message' + message;
    res.redirect(redirectUrl);
}
exports.handleEmailConfirmationError = handleEmailConfirmationError;
// Handle user confirmation: 
// it returns the confirmation email from:
// user register || update user email 
function handleRegisterOrUpdateEmailConfirmation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield processEmailConfirmation(req, res, 'register_or_update_email');
    });
}
exports.handleRegisterOrUpdateEmailConfirmation = handleRegisterOrUpdateEmailConfirmation;
// Handle user confirmation: 
// it returns the confirmation email from:
// forgot password 
function handleForgotPasswordConfirmationReturn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield processEmailConfirmation(req, res, 'forgot-password');
    });
}
exports.handleForgotPasswordConfirmationReturn = handleForgotPasswordConfirmationReturn;
function processEmailConfirmation(req, res, goal) {
    return __awaiter(this, void 0, void 0, function* () {
        let messageQueryString = "";
        try {
            const uniqueString = req.params.uniqueString;
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                messageQueryString = `?error=true&message=Invalid id. 
            <br>Please verify the link sent.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            const verificationData = yield (0, users_model_1.getUserVerificationById)(id);
            if (verificationData.length) {
                const { expires_at } = verificationData[0];
                const hashedUniqueString = verificationData[0].unique_string;
                if (expires_at < Date.now()) {
                    // The verification record is not necessary any more, 
                    // also should be deleted to avoid using the same link again
                    (0, users_model_1.deleteUserVerification)(verificationData[0].user_id);
                    messageQueryString = `?error=true&message=
                Your confirmation email message has expired. 
                <br>To receive a new message, <br>use [forgot password?]`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                    return;
                }
                const match = yield bcrypt.compare(uniqueString, hashedUniqueString);
                if (match) {
                    if (goal === 'register_or_update_email') {
                        const updatedUser = yield (0, users_model_1.confirmUser)(id);
                        if (updatedUser.length) {
                            // The verification record is not necessary any more, 
                            // also should be deleted to avoid using the same link again
                            (0, users_model_1.deleteUserVerification)(verificationData[0].user_id);
                            messageQueryString = `?error=false&message=
                        Your email has been successfully verified.
                        <br><br>You can log in to the application now!`;
                            handleEmailConfirmationError(req, res, messageQueryString);
                            return;
                        }
                        messageQueryString = `?error=true&message=
                    <p>Error while attempting to update the user confirmation.
                    <br>Please, try to log in or register again.`;
                        handleEmailConfirmationError(req, res, messageQueryString);
                        return;
                    }
                    // when goal is forgot-password process
                    return res.render(path.join(__dirname, "../../../dist/src/views/reset-password"), { email: verificationData[0].email });
                }
                messageQueryString = `?error=true&message=
            Error on security keys. 
            <br>Please, verify the link.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            messageQueryString = `?error=true&message=
        The account related to this confirmation doesn't exist or this process has already been done.
        <br>Please, try to log in or start the process again.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        }
        catch (error) {
            messageQueryString = `?error=true&message=
        Error attempting to confirm your email.
        <br>Please, verify the link or start the process again`;
            handleEmailConfirmationError(req, res, messageQueryString);
        }
    });
}
function listAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveredUsers = yield (0, users_model_1.getAllUsers)();
            if (recoveredUsers.length)
                return res.status(200).json(recoveredUsers);
            return res.status(404).json({ error: 'Can not find user.' });
        }
        catch (error) {
            console.error(`listAllUsers Error-> ${error}`);
            res.status(500).json({ error: 'Failed recovering users.' });
        }
    });
}
exports.listAllUsers = listAllUsers;
function httpGetUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = req.params;
            // Validation
            if (isNaN(Number(key.id)))
                return res.status(400).json({ error: 'the ID must be a number' });
            const recoveredUser = yield (0, users_model_1.getUserByKey)(key);
            if (recoveredUser.length)
                return res.status(200).json(recoveredUser[0]);
            return res.status(404).json({ error: 'user not found' });
        }
        catch (error) {
            console.error(`httpGetUser Error-> ${error}`);
            res.status(500).json({ error: 'error attempting to access the user' });
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
            if (isNaN(Number(userId)))
                return res.status(400).json({ error: 'the ID must be a number' });
            if (!checkUserName(name))
                return res.status(400).json({ error: 'invalid name' });
            if (!CheckCPF(cpf))
                return res.status(400).json({ error: 'invalid cpf' });
            if (yield checkCpfAlreadyUsed(userId, cpf))
                return res.status(409).json({ error: 'cpf already in use' });
            const userData = { name, cpf };
            const updatedUser = yield (0, users_model_1.updateUser)(userId, userData);
            if (updatedUser.length)
                return res.status(200).json(updatedUser[0]);
            return res.status(404).json({ error: 'user not found' });
        }
        catch (error) {
            console.error(`httpUpdateUser Error-> ${error}`);
            res.status(500).json({ error: 'error attempting to update the user' });
        }
    });
}
exports.httpUpdateUser = httpUpdateUser;
function handleUserDelete(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            // Validation 
            if (isNaN(Number(userId)))
                return res.status(400).json({ error: 'the ID must be a number' });
            const deletedUserInfo = yield (0, users_model_1.deleteUser)(userId);
            if (deletedUserInfo)
                return res.status(200).json({ message: `User id ${deletedUserInfo.id} successfully deleted!` });
            return res.status(404).json({ error: 'user not found' });
        }
        catch (error) {
            console.error(`handleUserDelete Error-> ${error}`);
            res.status(500).json({ error: 'error attempting to delete the user' });
        }
    });
}
exports.handleUserDelete = handleUserDelete;
function httpUpdateUserEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            let { email } = req.body;
            // Validation
            if (isNaN(Number(userId)))
                return res.status(400).json({ error: 'the ID must be a number' });
            if (!checkEmail(email))
                return res.status(400).json({ error: 'invalid email.' });
            if (yield checkEmailAlreadyUsed(userId, email))
                return res.status(409).json({ error: 'email already in use' });
            const recoveredUser = yield (0, users_model_1.getUserByKey)({ id: userId });
            if (!recoveredUser.length)
                return res.status(404).json({ error: 'user not found' });
            const checkIfEmailChanged = yield (0, users_model_1.getUserByKey)({ id: userId });
            // To verify if we are actually changing the email or if it's still the same
            if (checkIfEmailChanged.length && checkIfEmailChanged[0].email == email)
                return res.status(200).json(checkIfEmailChanged[0]);
            // update email and update verified=false in order to force validate the email again
            const userData = { email: email, verified: false };
            const updatedUser = yield (0, users_model_1.updateEmail)(userId, checkIfEmailChanged[0].email, userData);
            if (updatedUser.length) {
                yield sendConfirmationEmail(req, res, email, updatedUser[0].id, 'update-user-email');
                return res.status(200).json(updatedUser[0]);
            }
            return res.status(400).json({ error: 'error attempting to update the email' });
        }
        catch (error) {
            console.error(`httpUpdateUserEmail Error-> ${error}`);
            res.status(500).json({ error: 'error attempting to update the email' });
        }
    });
}
exports.httpUpdateUserEmail = httpUpdateUserEmail;
function renderForgotPasswordPage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render(path.join(__dirname, "../../../dist/src/views/forgot-password"));
    });
}
exports.renderForgotPasswordPage = renderForgotPasswordPage;
function postForgotPasswordEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            let messageQueryString = "";
            if (email == "") {
                messageQueryString = `?error=true&message=
            Invalid email.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            if (!checkEmail(email)) {
                messageQueryString = `?error=true&message=
            Invalid email.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            const recoveredUser = yield (0, users_model_1.getUserByKey)({ email: email });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
            Invalid email.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            const loginData = {
                email: email,
                action: 'reset-password'
            };
            const login = (yield (0, users_model_1.signinUser)(loginData, bcrypt, saltRounds)) || [];
            if (!login.length) {
                messageQueryString = `?error=true&message=
            User not found.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            // Create a one time link valid for 30 minutes (inside sendConfirmationEmail() )
            // Send confirmation email
            sendConfirmationEmail(req, res, email, recoveredUser[0].id, 'reset-password');
            messageQueryString = `?error=false&message=
        The link to reset your password has been sent to your email.`;
            handleEmailConfirmationError(req, res, messageQueryString);
        }
        catch (error) {
            console.error(`postForgotPasswordEmail Error-> ${error}`);
            res.status(500).json({ error: 'error attempting to reset password' });
        }
    });
}
exports.postForgotPasswordEmail = postForgotPasswordEmail;
function postResetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { id, uniqueString } = req.params;
            const { password, password2 } = req.body;
            let messageQueryString = "";
            if (id == "" || uniqueString == "") {
                messageQueryString = `?error=true&message=
            Invalid parameters.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            if (isNaN(Number(id))) {
                messageQueryString = `?error=true&message=
            Invalid ID.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            if (password.length < passwordSize) {
                messageQueryString = `?error=true&message=
            Password must contain at least ${passwordSize} characters.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            if (password !== password2) {
                messageQueryString = `?error=true&message=
            Password and confirmation password do not match.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            const recoveredUser = yield (0, users_model_1.getUserByKey)({ id });
            if (!recoveredUser.length) {
                messageQueryString = `?error=true&message=
            Invalid ID.`;
                handleEmailConfirmationError(req, res, messageQueryString);
                return;
            }
            const loginData = {
                email: recoveredUser[0].email,
                action: 'reset-password'
            };
            const login = (yield (0, users_model_1.signinUser)(loginData, bcrypt, saltRounds)) || [];
            if (login.length) {
                // Create a one time link valid for 30 minutes
                const newPassword = bcrypt.hashSync(password, saltRounds);
                const loginData = {
                    email: recoveredUser[0].email,
                    password: newPassword
                };
                const resetedPassword = yield (0, users_model_1.resetLoginPassword)(loginData, bcrypt, saltRounds);
                if (!resetedPassword.email) {
                    messageQueryString = `?error=true&message=
                Error attempting to update your email. <br>
                Please, review your data and try again.`;
                    handleEmailConfirmationError(req, res, messageQueryString);
                    return;
                }
                // Just in case the user had registered 
                // but before confirm his email has requested
                // reset password - it also update users.updated_at field
                const updatedUser = yield (0, users_model_1.confirmUser)(id);
                // The verification record is not necessary any more, 
                // also should be deleted to avoid using the same link again
                (0, users_model_1.deleteUserVerification)(recoveredUser[0].id);
                messageQueryString = `?error=false&message=
            New password defined successfully for ${resetedPassword.email}. <br>
            You can log in now.`;
                handleEmailConfirmationError(req, res, messageQueryString);
            }
        }
        catch (error) {
            console.error(`postResetPassword Error-> ${error}`);
            res.status(500).json({ error: 'error attempting to reset password' });
        }
    });
}
exports.postResetPassword = postResetPassword;
// <Block of validation functions----->
function checkUserName(name) {
    // The number of characters must be between 3 and 100. 
    // The string should only contain alphanumeric characters and/or underscores (_).
    // The first character of the string should be alphabetic
    if (!name)
        return false;
    if (/^[A-Za-z\s]{3,100}$/.test(name))
        return true;
    return false;
}
function checkUserPwd(pwd) {
    // At least one lower case, one upper case, one digit and one special character. 
    // Size between 8 to 24
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    if (!pwd)
        return false;
    if (PWD_REGEX.test(pwd))
        return true;
    return false;
}
function checkEmail(email) {
    if (!email)
        return false;
    if (email.trim() === '')
        return false;
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
        return false;
    if (email.length < 3 || email.length > 100)
        return false;
    return true;
}
function checkEmailExists(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = { email: email };
        const exists = yield (0, users_model_1.getUserByKey)(key);
        if (exists.length)
            return true;
        return false;
    });
}
function checkCpfExists(cpf) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = { cpf: cpf };
        const exists = yield (0, users_model_1.getUserByKey)(key);
        if (exists.length)
            return true;
        return false;
    });
}
function checkCpfAlreadyUsed(id, cpf) {
    return __awaiter(this, void 0, void 0, function* () {
        const idSearch = { id: id };
        const keySearch = { cpf: cpf };
        const exists = yield (0, users_model_1.getKeyAlreadyUsedByAnotherId)(idSearch, keySearch);
        if (exists.length)
            return true;
        return false;
    });
}
function checkEmailAlreadyUsed(id, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const idSearch = { id: id };
        const keySearch = { email: email };
        const exists = yield (0, users_model_1.getKeyAlreadyUsedByAnotherId)(idSearch, keySearch);
        if (exists.length)
            return true;
        return false;
    });
}
function formatCPF(cpf) {
    // let's keep only the numbers
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.slice(0, 11);
}
function CheckCPF(strCPF) {
    let Soma;
    let Resto;
    let validaKey = ((process.env.CPF_VALIDATION || "1") == "1") ? true : false;
    let i = 1;
    if (!validaKey)
        return true; // validation has been turned off.
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
function validateEmail(email) {
    if (!email)
        return false;
    if (email.trim() === '')
        return false;
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
        return false;
    if (email.length < 3 || email.length > 100)
        return false;
    return true;
}
function checkPassword(password) {
    if (!password)
        return false;
    if (password.length < passwordSize)
        return false;
    return true;
}
