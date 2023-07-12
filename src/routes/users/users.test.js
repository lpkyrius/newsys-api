const request = require('supertest');
const app = require('../../app');
// const { db } = require('../../services/postgresql');

describe('Users API', () => {
    // beforeAll( async () => {
    //     await db;
    // });
    // afterAll( async () => {
    //     //await dbDisconnect();
    // });

    // usersRouter.post('/signin',     handleSignin); 
    describe('Test POST /userSignIn', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .post('/signin')
                .send({
                    "email": "lpkyrius@hotmail.com",
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
        let email = "test" + randomComplement + "@abc"+randomComplement+".com";
        let password = randomComplement+"test123";
        let name = "Test "+ randomComplement;
        let cpf = "00930475763";
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

        describe('Test POST /register blank email', () => {
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

        // Still need to see how could we test a successful register due to the CPF validation
        // -----------------------------------------------------------------------------------
        // describe('Test POST /register', () => {
        //     test('It should respond with 201 success + Content-Type = json', async () => {
        //         email = "test" + randomComplement + "@abc"+randomComplement+".com";
        //         password = randomComplement+"test123";
        //         name = "Test "+ randomComplement;
        //         cpf = "19640375730";
        //         userDataWithoutDate = {
        //             email: email,
        //             password: password,
        //             name: name,
        //             cpf: cpf
        //         }
        //         const response = await request(app)
        //             .post('/register')
        //             .send(userDataWithoutDate)
        //             .expect('Content-Type', /json/)
        //             .expect(201);
                
        //         // For any date data
        //         const requestDate = new Date().valueOf(); // user.joined 
        //         const responseDate = new Date(response.body.joined).valueOf();
        //         expect(responseDate).toBe(requestDate);

        //         expect(response.body).toMatchObject(userDataWithoutDate);
        //     });
        // });
        
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
    // usersRouter.get('/confirm/:id', handleEmailConfirmation); 
    // usersRouter.put('/update_user_email/:id',httpUpdateUserEmail);

});