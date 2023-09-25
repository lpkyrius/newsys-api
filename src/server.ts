// server functions
import * as http from 'http';
import app from './app';
import swaggerDocs from './services/swagger';
// import swaggerUi from 'swagger-ui-express';
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const serverAddress = `${process.env.SERVER_ADDRESS}:${PORT}`;
const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        swaggerDocs(app);
        console.log(`Listening on PORT ${PORT}... @ ${serverAddress}`);
        console.log(`DB connected @ ${process.env.DB_HOST}:${process.env.DB_PORT} DbName: ${process.env.DB_NAME}`);
        console.log(`Docs available @ ${process.env.SERVER_ADDRESS}:${PORT}/api-docs`); 
    });
}

startServer();