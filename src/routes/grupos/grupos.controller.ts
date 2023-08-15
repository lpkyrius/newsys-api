import { Request, Response } from 'express';

const { getAllGrupos } = require('../../models/grupos.model');

async function httpGetAllGrupos(req: Request, res: Response) {
    return res.status(200).json(await getAllGrupos());
}

module.exports = {
    httpGetAllGrupos,
};
