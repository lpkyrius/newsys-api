const express = require('express'); 

const  { 
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    getUser,
    updateUser 
} =  require('./users.controller');

const usersRouter = express.Router();

usersRouter.post('/signin', handleSignin); //{ signin.handleSignin(req, res, db, bcrypt)}) // (req, res, db, bcrypt) -> dependency injection
usersRouter.post('/register', handleRegister); //{ register.handleRegister(req, res, db, bcrypt)}) 
usersRouter.get('/listUser', httpGetAllUsers); 
usersRouter.get('/profile/:id', getUser); 
usersRouter.put('/update_user',updateUser); //{ register.handleRegister(req, res, db, bcrypt)}) 

module.exports = usersRouter;

