//import { getAllGroups } from '../../models/group.model';
import getAllGroups from '../../models/groups.model';

async function httpGetAllGroups(req, res) {
    return res.status(200).json(await getAllGroups());
}

export {
    httpGetAllGroups
};
