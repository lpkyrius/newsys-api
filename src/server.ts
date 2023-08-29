// server functions
import http from 'http';
import app from './app';
require('dotenv').config();
const PORT = process.env.PORT;
const serverAddress = `${process.env.SERVER_ADDRESS || 'http://localhost'}:${PORT}`;
const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        // await function_name();
        console.log(`Listening on PORT ${PORT}... @ ${serverAddress}`);
    });
}

startServer();