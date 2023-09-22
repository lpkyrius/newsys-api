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
const users_model_1 = require("../../models/users.model");
require('dotenv').config();
describe('Users API', () => {
    // Data to be used on our tests
    const randomComplement = (Math.floor((Math.random() * 100) + 1)).toString();
    let id = 0;
    let email = "user.test." + randomComplement + "@abc" + randomComplement + ".com";
    let password = randomComplement + "test123";
    let name = "User Test";
    let cpf = "57376105867";
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
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create main User Test data
        const mainResponse = yield (0, supertest_1.default)(app_1.default)
            .post('/users/register')
            .send(mainCreatedUser);
        // save new id generated for next tests and final delete
        mainCreatedUser.id = Number(mainResponse.body.id);
        // Create sec User Test data
        secCreatedUser.cpf = "31445735156";
        secCreatedUser.email = "sec." + mainCreatedUser.email;
        const secResponse = yield (0, supertest_1.default)(app_1.default)
            .post('/users/register')
            .send(secCreatedUser);
        // save new id generated for next tests and final delete
        secCreatedUser.id = Number(secResponse.body.id);
        console.log('Temporary Users created and deleted (IDs):', mainCreatedUser.id, secCreatedUser.id);
    }));
    afterAll(() => {
        // console.log(message);
    });
    // usersRouter.post('/users/register', handleRegister); 
    describe('Test POST /users/register', () => {
        describe('Test POST /users/register bad format email', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
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
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
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
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
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
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
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
                let userDataWithoutDate = Object.assign({}, mainCreatedUser);
                userDataWithoutDate.cpf = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
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
            test('It should respond with 409 Conflict + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(409);
            }));
        });
        describe('Test POST /users/register cpf already exists', () => {
            let userDataWithoutDate = Object.assign({}, mainCreatedUser);
            userDataWithoutDate.email = "new." + userDataWithoutDate.email;
            test('It should respond with 409 Conflict + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/users/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(409);
            }));
        });
    });
    // usersRouter.post('/users/signin',     handleSignin); 
    describe('Test POST /users/signIn', () => {
        test('It should respond with 400 Bad Request due to user not validated yet', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/users/signin')
                .send({
                "email": mainCreatedUser.email,
                "password": mainCreatedUser.password
            })
                .expect('Content-Type', /json/)
                .expect(400);
        }));
        test('It should respond with 200 success - login', () => __awaiter(void 0, void 0, void 0, function* () {
            // Forces email verification for the test user
            yield (0, users_model_1.confirmUser)(mainCreatedUser.id);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/users/signin')
                .send({
                "email": mainCreatedUser.email,
                "password": mainCreatedUser.password
            })
                .expect('Content-Type', /json/)
                .expect(200);
        }));
        test('It should respond with 400 bad request - invalid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/users/signin')
                .send({
                "email": mainCreatedUser.email,
                "password": ""
            })
                .expect('Content-Type', /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                "error": "Invalid data."
            });
        }));
    });
    // usersRouter.get('/users/users', httpGetAllUsers); 
    describe('Test GET /users/users', () => {
        test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/users')
                .expect('Content-Type', /json/)
                .expect(200);
        }));
    });
    // usersRouter.get('/profile/:id', httpGetUser); 
    describe('Test GET /users/profile/:id', () => {
        test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/users/profile/' + mainCreatedUser.id)
                .expect('Content-Type', /json/)
                .expect(200);
        }));
    });
    // usersRouter.put('/update-user/:id',httpUpdateUser);
    describe('Test PUT /users/update-user/:id', () => {
        describe('Test PUT /users/update-user/:id bad format name', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                editableUser.name = "test#$";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user/' + mainCreatedUser.id)
                    .send(editableUser)
                    .expect('Content-Type', /json/)
                    .expect(400);
                editableUser.name = name;
            }));
        });
        describe('Test PUT /users/update-user/:id blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                editableUser.name = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user/' + mainCreatedUser.id)
                    .send(editableUser)
                    .expect('Content-Type', /json/)
                    .expect(400);
                editableUser.name = name;
            }));
        });
        // Test only if the CPF_VALIDATION is ON
        if ((process.env.CPF_VALIDATION || "1") == "1") {
            describe('Test PUT /users/update-user/:id blank cpf', () => {
                test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                    editableUser.cpf = "";
                    const response = yield (0, supertest_1.default)(app_1.default)
                        .put('/users/update-user/' + mainCreatedUser.id)
                        .send(editableUser)
                        .expect('Content-Type', /json/)
                        .expect(400);
                    editableUser.cpf = cpf;
                }));
            });
        }
        describe('Test PUT /users/update-user/:id', () => {
            editableUser = {
                name: mainCreatedUser.name,
                cpf: mainCreatedUser.cpf,
            };
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user/' + mainCreatedUser.id)
                    .send(editableUser)
                    .expect('Content-Type', /json/)
                    .expect(200);
            }));
        });
    });
    // usersRouter.put('/users/update-user-email/:id',httpUpdateUserEmail);
    describe('Test PUT /users/update-user-email/:id', () => {
        describe('Test PUT /users/update-user-email/:id with an email already used', () => {
            test('It should respond with 409 conflict + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user-email/' + mainCreatedUser.id)
                    .send({ "email": secCreatedUser.email })
                    .expect('Content-Type', /json/)
                    .expect(409);
            }));
        });
        describe('Test PUT /users/update-user-email/:id with bad format email', () => {
            test('It should respond with 400 fail + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user-email/' + mainCreatedUser.id)
                    .send({ "email": "email.com" })
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test PUT /users/update-user-email/:id with an id that does not exist', () => {
            test('It should respond with 404 not found + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user-email/0')
                    .send({ "email": "myemail@myemail.com" })
                    .expect('Content-Type', /json/)
                    .expect(404);
            }));
        });
        describe('Test PUT /users/update-user-email/:id with a valid email', () => {
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/users/update-user-email/' + mainCreatedUser.id)
                    .send({ "email": "myemail@myemail.com" })
                    .expect('Content-Type', /json/)
                    .expect(200);
            }));
        });
    });
    // usersRouter.delete('/users/delete/:id', handleUserDelete);
    describe('Test delete /users/delete/:id', () => {
        describe('Test delete /users/delete/:id Main Temporary User', () => {
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .delete('/users/delete/' + mainCreatedUser.id)
                    .expect('Content-Type', /json/)
                    .expect(200);
            }));
        });
        describe('Test delete /users/delete/:id general test', () => {
            test('It should respond with 404 not found', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .delete('/users/delete/' + mainCreatedUser.id)
                    .expect('Content-Type', /json/)
                    .expect(404);
            }));
        });
        describe('Test delete /users/delete/:id Sec Temporary User', () => {
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .delete('/users/delete/' + secCreatedUser.id)
                    .expect('Content-Type', /json/)
                    .expect(200);
            }));
        });
    });
});
