const express = require('express'); 

const  {
    home, 
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser,
    httpUpdateUser,
    handleConfirmation 
} =  require('./users.controller');

const usersRouter = express.Router();

usersRouter.get('/', home); 
usersRouter.post('/signin', handleSignin); 
usersRouter.post('/register', handleRegister); 
usersRouter.get('/listUsers', httpGetAllUsers); 
usersRouter.get('/profile/:id', httpGetUser); 
usersRouter.put('/update_user/:id',httpUpdateUser);
usersRouter.get('/confirm/:id', handleConfirmation); // handleRegister email - confirmation route

module.exports = usersRouter;

