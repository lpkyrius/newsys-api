import express from 'express'; 

// const cors = require('cors'); 
import usersRouter from './routes/users/users.router';
// import gruposRouter from './routes/grupos/grupos.router';
// const usersRouter = require('./routes/users/users.router');
const gruposRouter = require('./routes/grupos/grupos.router');

const app = express();

// app.use(cors({
//     origin: 'http://localhost:3000',
// }));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {res.status(200).send('New SAVIC - RCC Brasil')}); 
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