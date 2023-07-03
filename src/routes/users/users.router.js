const express = require('express'); 

const  { 
    handleSignin,
    handleRegister,
    listUser 
} =  require('./users.controller');

const signinRouter = express.Router();
const registerRouter = express.Router();

signinRouter.post('/signin', (req, res) => { handleSignin(req, res)}); //{ signin.handleSignin(req, res, db, bcrypt)}) // (req, res, db, bcrypt) -> dependency injection
signinRouter.post('/register', (req, res) => { handleRegister(req, res)}); //{ register.handleRegister(req, res, db, bcrypt)}) 
signinRouter.get('/listUser', (req, res) => { listUser(req, res) }); 

module.exports = signinRouter;

