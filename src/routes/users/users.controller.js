//const database = require('../../models/users.model');

const saltRounds = 10;
const pass1 = 'ann123';
const hash1 = '$2b$10$PxMr1mHQ3ZzD241Ibp1Pueiqh1YLwKC4GydyEnXD83VUrcHSw8WQC';
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            cpf: '00000000000',
            email: 'john@gmail.com',
            joined: new Date(),
            password: 'john123',
        },
        {
            id: '124',
            name: 'Sally',
            cpf: '00000000000',
            email: 'sally@gmail.com',
            joined: new Date(),
            password: 'sally123',
        }
    ],
    login: [
        {
            id: '223',
            hash: '',
            email: 'john@gmail.com',
        }
    ] 
};

function handleSignin(req, res, bcrypt) {

    // console.log(bcrypt.compareSync(pass1, hash1)); // true
    // console.log(bcrypt.compareSync("1234", hash1)); // false

    bcrypt.compare(pass1, hash1, function(err, res) {
        console.log('first guess', res);
    });
    bcrypt.compare("34w342", hash1, function(err, res) {
        console.log('second guess', res);
    });
    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password){
            return res.json('success');
        } else {
            return res.status(400).json('Erro no login :(');
        }
}

function handleRegister(req, res, bcrypt) {
    const { email, password, name, cpf } = req.body;
    //console.log(bcrypt);
    bcrypt.hash(password, saltRounds, function(err, hash) {
        console.log(hash);
    }); 

    database.users.push({
        id: '125',
        name: name,
        cpf: cpf,
        email: email,
        joined: new Date(),
        password: password,
    })
    res.json(database.users[database.users.length-1]);
}

function listUser(req, res) {
    res.send(database.users);
}

function getUser(req, res) {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id){
            found = true; 
            return res.json(user);
        }
    })
    if (!found){
        res.status(400).json('Usuário não localizado');
    }
}

function updateUser(req, res) {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id){
            found = true;
            // update data

            return res.json(user);
        }
    })
    if (!found){
        res.status(400).json('Usuário não localizado');
    }
}


module.exports = {
    handleSignin,
    handleRegister,
    listUser,
    getUser, 
    updateUser
};