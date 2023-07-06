const { getAllUsers, registerUser } = require('../../models/users.model');

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

async function handleRegister(req, res, bcrypt) {
    
    const user = req.body;
    // let password = req.body.password;

    user.joined = new Date();
    if (isNaN(user.joined)) {
        return res.status(400).json({
            error: 'Data de registro inválida.',
        });
    }

    // console.log('before hash', password);
    // bcrypt.hash(password, saltRounds, function(err, hash) {
    //     console.log('hash', hash);
    //     req.body.password = hash;
    // }); 
    // console.log('after hash', req.body.password);


    //console.log('calling model...')
    //console.log(registerUser(user));
    //return res.status(200).json(await registerUser(user));

    await registerUser(user);
    return res.status(201).json(user);

   

    // res.status(200).json(await registerUser(req, res));
    //res.json(database.users[database.users.length-1]);
}

async function httpGetAllUsers(req, res) {
    return res.status(200).json(await getAllUsers());
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
    httpGetAllUsers,
    getUser, 
    updateUser
};