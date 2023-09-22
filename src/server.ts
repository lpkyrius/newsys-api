// server functions
import * as http from 'http';
import app from './app';
require('dotenv').config();
const PORT = process.env.PORT;
const serverAddress = `${process.env.SERVER_ADDRESS || 'http://localhost'}:${PORT}`;
const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        const initialMessage = 
            `Listening on PORT ${PORT}... @ ${serverAddress} 
            DatabaseServer: ${process.env.DB_HOST} PORT:${process.env.DB_PORT} DbName:${process.env.DB_NAME}`;
        // console.log(`Listening on PORT ${PORT}... @ ${serverAddress}`);
        // console.log(`DB: ${process.env.DB_HOST}:${process.env.DB_PORT} DbName: ${process.env.DB_NAME}`);
        console.log(initialMessage);
    });
}

startServer();