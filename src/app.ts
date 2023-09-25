import express from 'express'; 
import cors from 'cors';
import usersRouter from './routes/users/users.router';
import groupRouter from './routes/groups/groups.router';

const app = express();

var allowedOrigins = ['http://localhost:3000',
                      'http://localhost:8000'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {res.status(200).send('New SYS - Your Company')}); 
app.use(usersRouter);
app.use(groupRouter);

export default app;