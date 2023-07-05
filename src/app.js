const express = require('express'); 
// const cors = require('cors'); 


const usersRouter = require('./routes/users/users.router');
const gruposRouter = require('./routes/grupos/grupos.router');

const app = express();

// app.use(cors({
//     origin: 'http://localhost:3000',
// }));
app.use(express.json());
app.use(usersRouter);
app.use(gruposRouter);

module.exports = app;

// CORS list
// var whitelist = ['http://localhost:3000', 'http://localhost:8000']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }