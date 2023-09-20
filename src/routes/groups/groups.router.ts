import express from 'express'; 

import  { 
    httpGetAllGroups 
} from './groups.controller';
 
const groupRouter = express.Router();

groupRouter.get('/group', httpGetAllGroups);

export default groupRouter;

// // Frontend call:
// const API_URL = http://localhost:8000/group
// async function httpGetAllGroups() {
//     const response = await fetch(`${API_URL}/group`) // http://localhost:8000/group
//     return await response.json();
// }
