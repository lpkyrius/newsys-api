"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// const cors = require('cors'); 
const usersRouter = require('./routes/users/users.router');
const gruposRouter = require('./routes/grupos/grupos.router');
const app = (0, express_1.default)();
// app.use(cors({
//     origin: 'http://localhost:3000',
// }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.get('/', (req, res) => { res.status(200).send('New SAVIC - RCC Brasil'); });
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
