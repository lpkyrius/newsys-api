const express = require('express'); 

const  { 
    handleSignin 
} =  require('./users.controller');

const signinRouter = express.Router();
// // const registerRouter = express.Router();

// signinRouter.get('/signin', ''); 
signinRouter.post('/signin', (req, res) => { handleSignin(req, res)}); //{ handleSignin(req, res, db, bcrypt)});
// // registerRouter.post('/register', (req, res) => { handleRegister(req, res)}); //{ handleRegister(req, res, db, bcrypt)});

module.exports = signinRouter;

