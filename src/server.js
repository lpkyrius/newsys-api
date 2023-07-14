// server functions
const http = require('http');
const app = require('./app');
require('dotenv').config();
const PORT = process.env.PORT;
const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        // await function_name();
        console.log(`Listening on PORT ${PORT}... @ http://localhost:${PORT}`);
    });
}

startServer();