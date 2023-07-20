const express = require('express'); 

const  {
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser,
    httpUpdateUser,
    handleEmailConfirmation,
    httpUpdateUserEmail,
    handleEmailConfirmationVerified,
    httpRenderForgotPassword,
    httpPostForgotPassword,
    httpResetPassword,
    httpPostResetPassword
} =  require('./users.controller');

const usersRouter = express.Router();

usersRouter.post('/signin',     handleSignin); 
usersRouter.post('/register', handleRegister); 
usersRouter.get('/listUsers', httpGetAllUsers); 
usersRouter.get('/profile/:id', httpGetUser); 
usersRouter.put('/update_user/:id',httpUpdateUser);
usersRouter.get('/confirm_email/:id/:uniqueString', handleEmailConfirmation); 
usersRouter.get('/email_verified', handleEmailConfirmationVerified); 
usersRouter.put('/update_user_email/:id',httpUpdateUserEmail);
usersRouter.get('/forgot_password', httpRenderForgotPassword);
usersRouter.post('/forgot_password', httpPostForgotPassword);
usersRouter.get('/reset_password/:id/:token', httpResetPassword);
usersRouter.post('/reset_password/:id/:token', httpPostResetPassword);

module.exports = usersRouter;

