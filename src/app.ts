import express from 'express'; 
import cors from 'cors';
import usersRouter from './routes/users/users.router';
import groupRouter from './routes/groups/groups.router';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {res.status(200).send('New SYS - Your Company')}); 
app.use(usersRouter);
app.use(groupRouter);

export default app;

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