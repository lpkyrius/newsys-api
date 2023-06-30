// express middleware

const express = require('express'); 
// const cors = require('cors'); 

const gruposRouter = require('./routes/grupos/grupos.router');

const app = express();

// app.use(cors({
//     origin: 'http://localhost:3000',
// }));


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

app.use(express.json());
app.use(gruposRouter);

module.exports = app;