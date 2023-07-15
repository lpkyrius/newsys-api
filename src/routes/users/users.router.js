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
    handleEmailConfirmationError
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
// usersRouter.get('/forgot_password/:id', httpRenderForgotPassword);
// usersRouter.post('/forgot_password/:id');
// usersRouter.get('/reset_password/:id');
// usersRouter.post('/reset_password/:id');

module.exports = usersRouter;

