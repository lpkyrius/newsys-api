//import { getAllGrupos } from '../../models/grupos.model';
import getAllGrupos from '../../models/grupos.model';

async function httpGetAllGrupos(req, res) {
    return res.status(200).json(await getAllGrupos());
}

export = {
    httpGetAllGrupos
};
