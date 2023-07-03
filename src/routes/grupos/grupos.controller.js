const grupos = require('../../models/grupos.model');

function getAllGrupos(req, res) {
    return res.status(200).json(grupos);
}

module.exports = {
    getAllGrupos,
};
