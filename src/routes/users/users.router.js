const express = require('express'); 

const  {
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser,
    httpUpdateUser,
    handleRegisterOrUpdateEmailConfirmation,
    httpUpdateUserEmail,
    handleEmailConfirmationVerified,
    httpRenderForgotPassword,
    httpPostForgotPassword,
    httpResetPassword,
    httpPostResetPassword,
    handleForgotPasswordConfirmation
} =  require('./users.controller');

const usersRouter = express.Router();

usersRouter.post('/signin', handleSignin); 
usersRouter.post('/register', handleRegister); 
usersRouter.get('/listUsers', httpGetAllUsers); 
usersRouter.get('/profile/:id', httpGetUser); 
usersRouter.put('/update_user/:id',httpUpdateUser);
usersRouter.get('/confirm_email/:id/:uniqueString', handleRegisterOrUpdateEmailConfirmation); 
usersRouter.get('/user_message', handleEmailConfirmationVerified); 
usersRouter.put('/update_user_email/:id',httpUpdateUserEmail);
usersRouter.get('/forgot_password', httpRenderForgotPassword);
usersRouter.post('/forgot_password', httpPostForgotPassword);
usersRouter.get('/reset_password/:id/:uniqueString', handleForgotPasswordConfirmation); // httpResetPassword 
usersRouter.post('/reset_password/:id/:uniqueString', httpPostResetPassword); // handleForgotPasswordConfirmation

module.exports = usersRouter;

