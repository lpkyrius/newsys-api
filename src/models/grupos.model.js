//const { promiseHooks } = require("v8");

const grupos = [
    {
        id: 1,
        name: 'Shekinah',
        inicio: new Date('2023-06-27T09:00:00.594Z'),
        dia: '1',
        hora: '21:00',
    },
    {
        id: 2,
        name: 'Rainha da Paz',
        inicio: new Date('1990-07-01T09:00:00.594Z'),
        dia: '4',
        hora: '19:30',
    },
    {
        id: 3,
        name: 'Jesus Vive',
        inicio: new Date('1980-02-01T09:00:00.594Z'),
        dia: '2',
        hora: '19:30',
    },
];

function getAllGrupos() {
    return grupos;
}

module.exports = {
    getAllGrupos,
};