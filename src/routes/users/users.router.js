const express = require('express'); 

const  { 
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser,
    updateUser 
} =  require('./users.controller');

const usersRouter = express.Router();

usersRouter.post('/signin', handleSignin); //{ signin.handleSignin(req, res, db, bcrypt)}) // (req, res, db, bcrypt) -> dependency injection
usersRouter.post('/register', handleRegister); //{ register.handleRegister(req, res, db, bcrypt)}) 
usersRouter.get('/listUsers', httpGetAllUsers); 
usersRouter.get('/profile/:id', httpGetUser); 
usersRouter.put('/update_user',updateUser); //{ register.handleRegister(req, res, db, bcrypt)}) 

module.exports = usersRouter;

