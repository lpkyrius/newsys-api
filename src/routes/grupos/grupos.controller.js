const { getAllGrupos } = require('../../models/grupos.model');

async function httpGetAllGrupos(req, res) {
    return res.status(200).json(await getAllGrupos());
}

module.exports = {
    httpGetAllGrupos,
};
