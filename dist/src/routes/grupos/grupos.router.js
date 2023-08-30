"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const grupos_controller_1 = require("./grupos.controller");
const gruposRouter = express_1.default.Router();
gruposRouter.get('/grupos', grupos_controller_1.httpGetAllGrupos);
exports.default = gruposRouter;
// // Frontend call:
// const API_URL = http://localhost:8000/grupos
// async function httpGetAllGrupos() {
//     const response = await fetch(`${API_URL}/grupos`) // http://localhost:8000/grupos
//     return await response.json();
// }
