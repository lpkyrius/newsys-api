"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../../app"));
const supertest_1 = __importDefault(require("supertest"));
let message = `⚠️ Warning: \r\n`;
describe('Users API', () => {
    // beforeAll( async () => {
    //     await db;
    // });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(message);
    }));
    // Data to be used on our tests
    let testId = "";
    const randomComplement = (Math.floor((Math.random() * 100) + 1)).toString();
    let email = "test" + randomComplement + "@abc" + randomComplement + ".com";
    let password = randomComplement + "test123";
    let name = "Automated Test";
    let cpf = "57376105867";
    const testUserData = {
        email: email,
        password: password,
        name: name,
        cpf: cpf
    };
    let userData = {
        name: name,
        cpf: cpf
    };
    // usersRouter.post('/users/register', handleRegister); 
    describe('Test POST /users/register', () => {
        describe('Test POST /users/register bad format email', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, testUserData);
                userDataWithoutDate.email = "test.com";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test POST /users/register blank email', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, testUserData);
                userDataWithoutDate.email = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test POST /users/register blank password', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, testUserData);
                userDataWithoutDate.password = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test POST /users/register blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, testUserData);
                userDataWithoutDate.name = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test POST /users/register blank cpf', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, testUserData);
                userDataWithoutDate.cpf = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test POST /users/register', () => {
            test('It should respond with 201 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, testUserData);
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(201);
                // save new id generated for next tests and final delete
                testId = response.body.id;
                message += `Test User created! testId generated as ${testId}  \r\n`;
                // For any date data
                // const requestDate = new Date().valueOf(); // user.created_at 
                // const responseDate = new Date(response.body.created_at).valueOf();
                // expect(responseDate).toBe(requestDate);
                delete userDataWithoutDate.password; // API does not return the password
                expect(response.body).toMatchObject(userDataWithoutDate);
            }));
        });
        describe('Test POST /users/register email already exists', () => {
            let userDataWithoutDate = Object.assign({}, testUserData);
            let tempCpf = userDataWithoutDate.cpf;
            userDataWithoutDate.cpf = "148.127.180-66";
            test('It should respond with 409 Conflict + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(409);
            }));
        });
        describe('Test POST /users/register cpf already exists', () => {
            let userDataWithoutDate = Object.assign({}, testUserData);
            let tempEmail = userDataWithoutDate.email;
            userDataWithoutDate.email = "new" + tempEmail;
            test('It should respond with 409 Conflict + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(409);
            }));
        });
    });
    // // usersRouter.put('/users/confirm-email/:id/:uniqueString', handleEmailConfirmation);
    // describe('Test GET /users/confirm-email/:id/:uniqueString', () => {
    //     describe('Test GET /users/confirm-email/:id/:uniqueString general test', () => {
    //         test('It should respond with 200 + Content-Type = html', async () => {
    //             const response = await request(app)
    //                 .get('/users/confirm-email/1/9a405464-bc99-4dc5-bf8d-1c5a596bf3b383')
    //                 .expect('Content-Type', "text/plain; charset=utf-8")
    //                 .expect(302)
    //                 // .end((err, res) => {
    //                 //     if (err) return done(err);
    //                 //     // Make another request to the redirected URL
    //                 //     request(app)
    //                 //       .get(res.headers.location)
    //                 //       .expect('Content-Type', /html/)
    //                 //       .expect(200)
    //                 //       .expect(/<p class="error">/) // This checks if the body contains the error message
    //                 //       .end(done);
    //                 //   });
    //         });
    //     });
    //     // Since it sends a HTML file with success or error message, there is way to test it.
    //     // describe('Test GET /users/users/confirm-email/:id/:uniqueString with id that does not exist', () => {
    //     //     test('It should respond with 400 fail + Content-Type = json', async () => {
    //     //         const response = await request(app)
    //     //             .get('/users/confirm-email/0/:uniqueString')
    //     //             .expect('Content-Type', /json/)
    //     //             .expect(400);
    //     //     });
    //     // });
    //     // describe('Test GET /users/confirm-email/:id/:uniqueString with a valid id', () => {
    //     //     test('It should respond with 200 success + Content-Type = json', async () => {
    //     //         const response = await request(app)
    //     //             .get('/users/confirm/83/3de13c32-8aeb-4774-b040-0270d783d5e883')
    //     //             .expect('Content-Type', /json/)
    //     //             .expect(200);
    //     //     });
    //     // });
    // });
    // usersRouter.delete('/users/delete/:id', handleUserDelete);
    describe('Test delete /users/delete/:id', () => {
        describe('Test delete /users/delete/:id general test', () => {
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .delete('/users/delete/' + testId)
                    .expect('Content-Type', /json/)
                    .expect(200);
            }));
        });
        describe('Test delete /users/delete/:id general test', () => {
            test('It should respond with 404 not found', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .delete('/users/delete/' + testId)
                    .expect('Content-Type', /json/)
                    .expect(404);
            }));
        });
    });
    // ------------------------------------------
    // MY CHANGES HAVE BEEN DONE UP TO THIS POINT
    // ------------------------------------------
    // // usersRouter.post('/users/signin',     handleSignin); 
    // describe('Test POST /users/signIn', () => {
    //     test('It should respond with 400 Bad Request due to user not validated yet', async () => {
    //         const response = await request(app)
    //             .post('/users/signin')
    //             .send({
    //             "email": userDataWithoutDate.email,
    //             "password": userDataWithoutDate.password
    //             })
    //             .expect('Content-Type', /json/)
    //             .expect(400);
    //     });
    //     // Forces email verification for the user
    //     const updatedUser = async () => {
    //         await confirmUser(testId);
    //         console.log(`Test User ${ testId } confirmed!`);
    //     };
    //     test('It should respond with 200 success', async () => {
    //         const response = await request(app)
    //             .post('/users/signin')
    //             .send({
    //             "email": "leandropassoscoach@gmail.com",
    //             "password": "leandropassoscoach123"
    //             })
    //             .expect('Content-Type', /json/)
    //             .expect(200);
    //     });
    //     test('It should respond with 400 bad request', async () => {
    //         const response = await request(app)
    //             .post('/users/signin')
    //             .send({
    //                 "email": "lpkyrius@hotmail.com",
    //                 "password": ""
    //             })
    //             .expect('Content-Type', /json/)
    //             .expect(400);
    //         expect(response.body).toStrictEqual(
    //             {
    //                 "error": "Dados inválidos."
    //             }
    //         );
    //     });
    // });
    // // usersRouter.get('/users/users', httpGetAllUsers); 
    // describe('Test GET /users/users', () => {
    //     test('It should respond with 200 success + Content-Type = json', async () => {
    //         const response = await request(app)
    //             .get('/users')
    //             .expect('Content-Type', /json/)
    //             .expect(200);
    //     });
    // });
    // // usersRouter.get('/profile/:id', httpGetUser); 
    // describe('Test GET /users/profile/1', () => {
    //     test('It should respond with 200 success + Content-Type = json', async () => {
    //         const response = await request(app)
    //             .get('/users/profile/1')
    //             .expect('Content-Type', /json/)
    //             .expect(200);
    //     });
    // });
    // // usersRouter.put('/update-user/:id',httpUpdateUser);
    // describe('Test PUT /users/update-user/:id', () => {
    //     describe('Test PUT /users/update-user/:id bad format name', () => {
    //         test('It should respond with 400 bad request + Content-Type = json', async () => {
    //             userData.name = "test#$";
    //             userData.cpf = cpf;
    //             const response = await request(app)
    //                 .put('/users/update-user/1')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(400);
    //         });
    //     });
    //     describe('Test PUT /users/update-user/:id blank name', () => {
    //         test('It should respond with 400 bad request + Content-Type = json', async () => {
    //             userData.name = "";
    //             userData.cpf = cpf;
    //             const response = await request(app)
    //                 .put('/users/update-user/1')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(400);
    //         });
    //     });   
    //     describe('Test PUT /users/update-user/:id blank cpf', () => {
    //         test('It should respond with 400 bad request + Content-Type = json', async () => {
    //             userData.name = name
    //             userData.cpf = "";
    //             const response = await request(app)
    //                 .put('/users/update-user/1')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(400);
    //         });
    //     });   
    //    describe('Test PUT /users/update-user/:id', () => {
    //         test('It should respond with 200 success + Content-Type = json', async () => {
    //             userData.name = name
    //             userData.cpf = cpf;
    //             const response = await request(app)
    //                 .put('/users/update-user/1')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(200);
    //             expect(response.body).toMatchObject(userData);
    //         });
    //     });
    // });
    // // usersRouter.put('/users/update-user-email/:id',httpUpdateUserEmail);
    // describe('Test PUT /users/update-user-email/:id', () => {
    //     userData.email = "lpkyrius@gmail.com"; <- use an fake email to actually update database test
    //     userData.cpf = "06763865040";
    //     describe('Test PUT /users/confirm-email/:id with an email already used', () => {
    //         test('It should respond with 409 conflict + Content-Type = json', async () => {
    //             const response = await request(app)
    //                 .put('/users/update-user-email/2')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(409);
    //         });
    //     });
    //     describe('Test PUT /users/update-user-email/:id with bad format email', () => {
    //         test('It should respond with 400 fail + Content-Type = json', async () => {
    //             userData.email = "lpkyriusgmail.com";
    //             const response = await request(app)
    //                 .put('/users/update-user-email/1')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(400);
    //         });
    //     });
    //     describe('Test PUT /users/update-user-email/:id with an id that does not exist', () => {
    //         test('It should respond with 404 not found + Content-Type = json', async () => {
    //             userData.email = "lpkyrius@zmail.com";
    //             userData.cpf = "573.761.058-67";
    //             const response = await request(app)
    //                 .put('/users/update-user-email/0')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(404);
    //         });
    //     });
    //     describe('Test PUT /users/update-user-email/:id with a valid email', () => {
    //         test('It should respond with 200 success + Content-Type = json', async () => {
    //             userData.email = "lpkyrius@gmail.com";
    //             userData.cpf = "00671067737";
    //             const response = await request(app)
    //                 .put('/users/update-user-email/1')
    //                 .send(userData)
    //                 .expect('Content-Type', /json/)
    //                 .expect(200);
    //         });
    //     });
    // });
});
