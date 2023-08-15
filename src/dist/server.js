"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// server functions
const http = require('http');
const app = require('./app');
require('dotenv').config();
const PORT = process.env.PORT;
const serverAddress = `${process.env.SERVER_ADDRESS || 'http://localhost'}:${PORT}`;
const server = http.createServer(app);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        server.listen(PORT, () => {
            // await function_name();
            console.log(`Listening on PORT ${PORT}... @ ${serverAddress}`);
        });
    });
}
startServer();
