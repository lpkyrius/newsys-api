//const database = require('../../models/users.model');
const database = {
    users: [
        {
            id: 1,
            name: 'John',
            cpf: '00000000000',
            email: 'john@gmail.com',
            joined: new Date(),
            password: 'john123',
        },
        {
            id: 2,
            name: 'Sally',
            cpf: '00000000000',
            email: 'sally@gmail.com',
            joined: new Date(),
            password: 'sally123',
        }
    ]
};

function handleSignin(req, res) {
    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password){
            return res.json('success');
        } else {
            return res.status(400).json('Erro no login :(');
        }
}
// function handleRegister(req, res) {
//     const { email, password, name } = req.body;
//     database.users.push({
//         id: 3,
//         name: name,
//         email: email,
//         joined: new Date(),
//         password: password,
//     })
//     res.json(database.users[database.users.length -1]);
// }


module.exports = {
    handleSignin,
};