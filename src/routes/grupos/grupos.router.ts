import express from 'express'; 

import  { 
    httpGetAllGrupos 
} from './grupos.controller';
 
const gruposRouter = express.Router();

gruposRouter.get('/grupos', httpGetAllGrupos);

export default gruposRouter;

// // Frontend call:
// const API_URL = http://localhost:8000/grupos
// async function httpGetAllGrupos() {
//     const response = await fetch(`${API_URL}/grupos`) // http://localhost:8000/grupos
//     return await response.json();
// }
