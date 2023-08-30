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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
//import { getAllGrupos } from '../../models/grupos.model';
const grupos_model_1 = __importDefault(require("../../models/grupos.model"));
function httpGetAllGrupos(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        return res.status(200).json(yield (0, grupos_model_1.default)());
    });
}
module.exports = {
    httpGetAllGrupos
};
