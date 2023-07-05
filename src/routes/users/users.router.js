const express = require('express'); 
const bcrypt = require('bcrypt');

const  { 
    handleSignin,
    handleRegister,
    listUser,
    getUser,
    updateUser 
} =  require('./users.controller');

const usersRouter = express.Router();

usersRouter.post('/signin', (req, res) => { handleSignin(req, res, bcrypt)}); //{ signin.handleSignin(req, res, db, bcrypt)}) // (req, res, db, bcrypt) -> dependency injection
usersRouter.post('/register', (req, res) => { handleRegister(req, res, bcrypt)}); //{ register.handleRegister(req, res, db, bcrypt)}) 
usersRouter.get('/listUser', (req, res) => { listUser(req, res) }); 
usersRouter.get('/profile/:id', (req, res) => { getUser(req, res) }); 
usersRouter.put('/update_user', (req, res) => { updateUser(req, res)}); //{ register.handleRegister(req, res, db, bcrypt)}) 

module.exports = usersRouter;

