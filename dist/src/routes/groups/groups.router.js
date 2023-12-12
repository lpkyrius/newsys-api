"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groups_controller_1 = require("./groups.controller");
const groupRouter = express_1.default.Router();
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
groupRouter.get('/group', verifyJWT_1.default, groups_controller_1.httpGetAllGroups);
exports.default = groupRouter;
// // Frontend call:
// const API_URL = http://localhost:8000/group
// async function httpGetAllGroups() {
//     const response = await fetch(`${API_URL}/group`) // http://localhost:8000/group
//     return await response.json();
// }
