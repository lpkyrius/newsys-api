const request = require('supertest');
const app = require('../../app');
let email = "";
let password = "";
let name = "";
let cpf = "";
let userData = {
    name: name,
    cpf: cpf
};
let message = `⚠️ Warning:

-> [POST /register] To a successful test we need a valid cpf 
(correct format + still not used yet).
So, it demands a manual test.

-> [PUT /update_user_email/:id] Even with a successful test,    
we do it by saving the same email, which means there was no
real update in database. 
So, it demands a manual test.`;


describe('Users API', () => {
    // beforeAll( async () => {
    //     await db;
    // });
    afterAll( async () => {
        console.log(message);
    });

    // usersRouter.post('/signin',     handleSignin); 
    describe('Test POST /userSignIn', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .post('/signin')
                .send({
                    "email": "lpkyrius@gmail.com",
                    "password": "lpkyrius123"
                })
                .expect('Content-Type', /json/)
                .expect(200);
        });

        test('It should respond with 400 bad request', async () => {
            const response = await request(app)
                .post('/signin')
                .send({
                    "email": "lpkyrius@hotmail.com",
                    "password": ""
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual(
                {
                    "error": "Dados inválidos."
                }
            );
        });
    });

    // usersRouter.post('/register', handleRegister); 
    describe('Test POST /register', () => {

        const randomComplement = (Math.floor((Math.random() * 100) + 1)).toString();
        email = "test" + randomComplement + "@abc"+randomComplement+".com";
        password = randomComplement+"test123";
        name = "Test "+ randomComplement;
        cpf = "00930475763";
        let userDataWithoutDate = {
            email: email,
            password: password,
            name: name,
            cpf: cpf
        }

        describe('Test POST /register email already exists', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userDataWithoutDate.email = "test.com";
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
            userDataWithoutDate.email = "lpkyrius@gmail.com";
        });

        describe('Test POST /register bad format email', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userDataWithoutDate.email = "test.com";
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
            userDataWithoutDate.email = email;
        });

        describe('Test POST /register blank email', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userDataWithoutDate.email = "";
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
            userDataWithoutDate.email = email;
        });
        
        describe('Test POST /register blank password', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userDataWithoutDate.password = "";
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
            userDataWithoutDate.password = password;
        });   

        describe('Test POST /register blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userDataWithoutDate.name = "";
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
            userDataWithoutDate.password = password;
        });   
 
        describe('Test POST /register cpf already exists', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });  

        describe('Test POST /register blank cpf', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userDataWithoutDate.cpf = "";
                const response = await request(app)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
            userDataWithoutDate.cpf = cpf;
        });   

        describe('Test POST /register', () => {
            // test('It should respond with 201 success + Content-Type = json', async () => {
            //     email = "test" + randomComplement + "@abc"+randomComplement+".com";
            //     password = randomComplement+"test123";
            //     name = "Test "+ randomComplement;
            //     cpf = "19640375730";
            //     userDataWithoutDate = {
            //         email: email,
            //         password: password,
            //         name: name,
            //         cpf: cpf
            //     }
            //     const response = await request(app)
            //         .post('/register')
            //         .send(userDataWithoutDate)
            //         .expect('Content-Type', /json/)
            //         .expect(201);
                
            //     // For any date data
            //     const requestDate = new Date().valueOf(); // user.joined 
            //     const responseDate = new Date(response.body.joined).valueOf();
            //     expect(responseDate).toBe(requestDate);

            //     expect(response.body).toMatchObject(userDataWithoutDate);
            // });
        });
    });

    // usersRouter.get('/listUsers', httpGetAllUsers); 
    describe('Test GET /listUsers', () => {
        test('It should respond with 200 success + Content-Type = json', async () => {
            const response = await request(app)
                .get('/listUsers')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    // usersRouter.get('/profile/:id', httpGetUser); 
    describe('Test GET /profile/82', () => {
        test('It should respond with 200 success + Content-Type = json', async () => {
            const response = await request(app)
                .get('/profile/82')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    // usersRouter.put('/update_user/:id',httpUpdateUser);
    describe('Test PUT /update_user/:id', () => {

        name = "Lpkyrius GMail";
        cpf = "00671067737";
        userData = {
            name: name,
            cpf: cpf
        }
        describe('Test PUT /update_user/:id bad format name', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userData.name = "test#$";
                userData.cpf = cpf;
                const response = await request(app)
                    .put('/update_user/82')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /update_user/:id blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userData.name = "";
                userData.cpf = cpf;
                const response = await request(app)
                    .put('/update_user/82')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });   
        
        describe('Test PUT /update_user/:id blank cpf', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                userData.name = name
                userData.cpf = "";
                const response = await request(app)
                    .put('/update_user/82')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });   

       describe('Test PUT /update_user/:id', () => {
            test('It should respond with 200 success + Content-Type = json', async () => {
                userData.name = name
                userData.cpf = cpf;
                const response = await request(app)
                    .put('/update_user/82')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(200);
                expect(response.body).toMatchObject(userData);
            });
        });

    });

    // usersRouter.put('/confirm/:id', handleEmailConfirmation);
    describe('Test PUT /confirm_email/:id', () => {

        describe('Test PUT /confirm_email/:id with invalid id', () => {
            test('It should respond with 400 fail + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/confirm_email/d')
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /confirm_email/:id with id that does not exist', () => {
            test('It should respond with 400 fail + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/confirm_email/0')
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /confirm_email/:id with a valid id', () => {
            test('It should respond with 200 success + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/confirm_email/83')
                    .expect('Content-Type', /json/)
                    .expect(200);
            });
        });
    });

    
    // usersRouter.put('/update_user_email/:id',httpUpdateUserEmail);
    describe('Test PUT /update_user_email/:id', () => {

        userData = {
            email: "lpkyrius@gmail.com"
        }
        describe('Test PUT /confirm_email/:id with an email already used', () => {
            test('It should respond with 400 fail + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/update_user_email/83')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /update_user_email/:id with bad format email', () => {
            test('It should respond with 400 fail + Content-Type = json', async () => {
                userData.email = "lpkyriusgmail.com"
                const response = await request(app)
                    .put('/update_user_email/d')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /update_user_email/:id with an id that does not exist', () => {
            test('It should respond with 400 fail + Content-Type = json', async () => {
                userData.email = "lpkyriusgmail.com"
                const response = await request(app)
                    .put('/update_user_email/0')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /update_user_email/:id with a valid email', () => {
            test('It should respond with 200 success + Content-Type = json', async () => {
                userData.email = "lpkyrius@hotmail.com"
                const response = await request(app)
                    .put('/update_user_email/83')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(200);
            });
        });
    });

});