const express = require('express'); 

const  { 
    httpGetAllGrupos 
} =  require('./grupos.controller');
 
const gruposRouter = express.Router();

gruposRouter.get('/grupos', httpGetAllGrupos);

module.exports = gruposRouter;

// // Frontend call:
// const API_URL = http://localhost:8000/grupos
// async function httpGetAllGrupos() {
//     const response = await fetch(`${API_URL}/grupos`) // http://localhost:8000/grupos
//     return await response.json();
// }
