import app from '../../app';
import request from 'supertest';
import { confirmUser } from "../../models/users.model";
require('dotenv').config();

describe('Users API', () => {

    // Data to be used on our tests
    const randomComplement = (Math.floor((Math.random() * 100) + 1)).toString();
    let id: number = 0;
    let email: string = "user.test." + randomComplement + "@abc" + randomComplement + ".com";
    let password: string = randomComplement + "test123";
    let name: string = "User Test";
    let cpf: string = "57376105867";
    let mainCreatedUser = {
        id: id,
        email: email,
        password: password,
        name: name,
        cpf: cpf
    };
    let secCreatedUser = Object.assign({}, mainCreatedUser);
    let editableUser = {
        name: mainCreatedUser.name,
        cpf: mainCreatedUser.cpf,
    };

    beforeAll( async () => {

        // Create main User Test data
        const mainResponse = await request(app)
            .post('/users/register')
            .send(mainCreatedUser);
        // save new id generated for next tests and final delete
        mainCreatedUser.id = Number(mainResponse.body.id);

        // Create sec User Test data
        secCreatedUser.cpf = "31445735156";
        secCreatedUser.email = "sec." + mainCreatedUser.email;
        const secResponse = await request(app)
            .post('/users/register')
            .send(secCreatedUser);
        // save new id generated for next tests and final delete
        secCreatedUser.id = Number(secResponse.body.id);

        console.log('Temporary Users created and deleted (IDs):',mainCreatedUser.id, secCreatedUser.id);

    });

    afterAll(() => {
        // console.log(message);
    });
    
    // usersRouter.post('/users/register', handleRegister); 
    describe('Test POST /users/register', () => {

        describe('Test POST /users/register bad format email', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                userDataWithoutDate.email = "test.com";
                
                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test POST /users/register blank email', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                userDataWithoutDate.email = "";
                
                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });
        
        describe('Test POST /users/register blank password', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                userDataWithoutDate.password = "";
                
                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });   

        describe('Test POST /users/register blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {

                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                userDataWithoutDate.name = "";

                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });   

        describe('Test POST /users/register blank cpf', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {

                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                userDataWithoutDate.cpf = "";

                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }); 
        });   

        // --------------------------------------------
        // >>>> Create Test User is on beforeAll() <<<<
        // --------------------------------------------
        // describe('Test POST /users/register', () => {
        //     test('It should respond with 201 success + Content-Type = json', async () => {

        //         let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                
        //         const response = await request(app)
        //             .post('/users/register')
        //             .send(userDataWithoutDate)
        //             .expect('Content-Type', /json/)
        //             .expect(201);
                
        //         // save new id generated for next tests and final delete
        //         mainCreatedUser.id = response.body.id;
        //         mainCreatedUser = Object.assign({}, mainCreatedUser);
        //         // For any date data
        //         // const requestDate = new Date().valueOf(); // user.created_at 
        //         // const responseDate = new Date(response.body.created_at).valueOf();
        //         // expect(responseDate).toBe(requestDate);

        //         // to avoid error with id (now that we have the created one)
        //         userDataWithoutDate.id = mainCreatedUser.id; 

        //         // to save the id created
        //         mainCreatedUser = Object.assign({}, userDataWithoutDate);

        //         // to avoid error with password - the API does not return it
        //         delete userDataWithoutDate.password;
        //         expect(response.body).toMatchObject(userDataWithoutDate);

        //     });
        // });

        describe('Test POST /users/register email already exists', () => {

            let userDataWithoutDate = Object.assign({}, mainCreatedUser);
            userDataWithoutDate.cpf = "148.127.180-66";

            test('It should respond with 409 Conflict + Content-Type = json', async () => {
                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(409);
            });
        });

        describe('Test POST /users/register cpf already exists', () => {

            let userDataWithoutDate = Object.assign({}, mainCreatedUser);
            userDataWithoutDate.email = "new." + userDataWithoutDate.email;

            test('It should respond with 409 Conflict + Content-Type = json', async () => {
                const response = await request(app)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(409);
            });
        });        

    });

    // usersRouter.post('/users/signin',     handleSignin); 
    describe('Test POST /users/signIn', () => {
        test('It should respond with 400 Bad Request due to user not validated yet', async () => {
            const response = await request(app)
                .post('/users/signin')
                .send({
                "email": mainCreatedUser.email,
                "password": mainCreatedUser.password
                })
                .expect('Content-Type', /json/)
                .expect(400);
        });

        test('It should respond with 200 success - login', async () => {

            // Forces email verification for the test user
            await confirmUser(mainCreatedUser.id);

            const response = await request(app)
                .post('/users/signin')
                .send({
                "email": mainCreatedUser.email,
                "password": mainCreatedUser.password
                })
                .expect('Content-Type', /json/)
                .expect(200);
        });

        test('It should respond with 400 bad request - invalid data', async () => {
            const response = await request(app)
                .post('/users/signin')
                .send({
                    "email": mainCreatedUser.email,
                    "password": ""
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual(
                {
                    "error": "Invalid data."
                }
            );
        });
    });

    // usersRouter.get('/users/users', httpGetAllUsers); 
    describe('Test GET /users/users', () => {
        test('It should respond with 200 success + Content-Type = json', async () => {
            const response = await request(app)
                .get('/users')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    // usersRouter.get('/profile/:id', httpGetUser); 
    describe('Test GET /users/profile/:id', () => {
        test('It should respond with 404 not found = json', async () => {
            const response = await request(app)
                .get('/users/profile/0')
                .expect('Content-Type', /json/)
                .expect(404);
        });
    });

    // usersRouter.get('/profile/:id', httpGetUser); 
    describe('Test GET /users/profile/:id', () => {
        test('It should respond with 200 success + Content-Type = json', async () => {
            const response = await request(app)
                .get('/users/profile/' + mainCreatedUser.id)
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    // usersRouter.put('/update-user/:id',httpUpdateUser);
    describe('Test PUT /users/update-user/:id', () => {

        describe('Test PUT /users/update-user/:id bad format name', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                editableUser.name = "test#$";
                const response = await request(app)
                    .put('/users/update-user/' + mainCreatedUser.id)
                    .send(editableUser)
                    .expect('Content-Type', /json/)
                    .expect(400);
                editableUser.name = name;
            });
        });

        describe('Test PUT /users/update-user/:id blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', async () => {
                editableUser.name = "";
                const response = await request(app)
                    .put('/users/update-user/' + mainCreatedUser.id)
                    .send(editableUser)
                    .expect('Content-Type', /json/)
                    .expect(400);
                editableUser.name = name;
            });
        });   
        
        // Test only if the CPF_VALIDATION is ON
        if ((process.env.CPF_VALIDATION || "1") == "1") {
            describe('Test PUT /users/update-user/:id blank cpf', () => {
                test('It should respond with 400 bad request + Content-Type = json', async () => {
                    editableUser.cpf = "";
                    const response = await request(app)
                        .put('/users/update-user/' + mainCreatedUser.id)
                        .send(editableUser)
                        .expect('Content-Type', /json/)
                        .expect(400);
                    editableUser.cpf = cpf;
                });
            });
        }   

       describe('Test PUT /users/update-user/:id', () => {

            editableUser = {
                name: mainCreatedUser.name,
                cpf: mainCreatedUser.cpf,
            };

            test('It should respond with 200 success + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/users/update-user/' + mainCreatedUser.id)
                    .send(editableUser)
                    .expect('Content-Type', /json/)
                    .expect(200);
            });
        });

    });
    
    // usersRouter.put('/users/update-user-email/:id',httpUpdateUserEmail);
    describe('Test PUT /users/update-user-email/:id', () => {
        describe('Test PUT /users/update-user-email/:id with an email already used', () => {
            test('It should respond with 409 conflict + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/users/update-user-email/' + mainCreatedUser.id)
                    .send({"email": secCreatedUser.email})
                    .expect('Content-Type', /json/)
                    .expect(409);
            });
        });

        describe('Test PUT /users/update-user-email/:id with bad format email', () => {
            test('It should respond with 400 fail + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/users/update-user-email/' + mainCreatedUser.id)
                    .send({"email": "email.com"})
                    .expect('Content-Type', /json/)
                    .expect(400);
            });
        });

        describe('Test PUT /users/update-user-email/:id with an id that does not exist', () => {
            test('It should respond with 404 not found + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/users/update-user-email/0')
                    .send({"email": "myemail@myemail.com"})
                    .expect('Content-Type', /json/)
                    .expect(404);
            });
        });

        describe('Test PUT /users/update-user-email/:id with a valid email', () => {
            test('It should respond with 200 success + Content-Type = json', async () => {
                const response = await request(app)
                    .put('/users/update-user-email/' + mainCreatedUser.id)
                    .send({"email": "myemail@myemail.com"})
                    .expect('Content-Type', /json/)
                    .expect(200);
            });
        });
    });

    // usersRouter.delete('/users/delete/:id', handleUserDelete);
    describe('Test delete /users/delete/:id', () => {

        describe('Test delete /users/delete/:id Main Temporary User', () => {
            test('It should respond with 200 success + Content-Type = json', async () => {
                const response = await request(app)
                    .delete('/users/delete/' + mainCreatedUser.id)
                    .expect('Content-Type', /json/)
                .expect(200);
            });
        });

        describe('Test delete /users/delete/:id general test', () => {
            test('It should respond with 404 not found', async () => {
                const response = await request(app)
                    .delete('/users/delete/' + mainCreatedUser.id)
                    .expect('Content-Type', /json/)
                .expect(404);
            });
        });

        describe('Test delete /users/delete/:id Sec Temporary User', () => {
            test('It should respond with 200 success + Content-Type = json', async () => {
                const response = await request(app)
                    .delete('/users/delete/' + secCreatedUser.id)
                    .expect('Content-Type', /json/)
                .expect(200);
            });
        });

    });

});