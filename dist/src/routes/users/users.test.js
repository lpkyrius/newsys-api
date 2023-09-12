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
let email = "";
let password = "";
let name = "";
let cpf = "";
let userData = {
    name: name,
    cpf: cpf,
    email: email
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
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(message);
    }));
    // usersRouter.post('/signin',     handleSignin); 
    describe('Test POST /userSignIn', () => {
        test('It should respond with 200 success', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/signin')
                .send({
                "email": "leandropassoscoach@gmail.com",
                "password": "leandropassoscoach123"
            })
                .expect('Content-Type', /json/)
                .expect(200);
        }));
        test('It should respond with 400 bad request', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/signin')
                .send({
                "email": "lpkyrius@hotmail.com",
                "password": ""
            })
                .expect('Content-Type', /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                "error": "Dados inválidos."
            });
        }));
    });
    // usersRouter.post('/register', handleRegister); 
    describe('Test POST /register', () => {
        const randomComplement = (Math.floor((Math.random() * 100) + 1)).toString();
        email = "test" + randomComplement + "@abc" + randomComplement + ".com";
        password = randomComplement + "test123";
        name = "Test " + randomComplement;
        cpf = "00930475763";
        let userDataWithoutDate = {
            email: email,
            password: password,
            name: name,
            cpf: cpf
        };
        describe('Test POST /register email already exists', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userDataWithoutDate.email = "test.com";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
            userDataWithoutDate.email = "lpkyrius@gmail.com";
        });
        describe('Test POST /register bad format email', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userDataWithoutDate.email = "test.com";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
            userDataWithoutDate.email = email;
        });
        describe('Test POST /register blank email', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userDataWithoutDate.email = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
            userDataWithoutDate.email = email;
        });
        describe('Test POST /register blank password', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userDataWithoutDate.password = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
            userDataWithoutDate.password = password;
        });
        describe('Test POST /register blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userDataWithoutDate.name = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
            userDataWithoutDate.password = password;
        });
        describe('Test POST /register cpf already exists', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test POST /register blank cpf', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userDataWithoutDate.cpf = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post('/register')
                    .send(userDataWithoutDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
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
            //     const requestDate = new Date().valueOf(); // user.created_at 
            //     const responseDate = new Date(response.body.created_at).valueOf();
            //     expect(responseDate).toBe(requestDate);
            //     expect(response.body).toMatchObject(userDataWithoutDate);
            // });
        });
    });
    // usersRouter.get('/listUsers', httpGetAllUsers); 
    describe('Test GET /listUsers', () => {
        test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/listUsers')
                .expect('Content-Type', /json/)
                .expect(200);
        }));
    });
    // usersRouter.get('/profile/:id', httpGetUser); 
    describe('Test GET /profile/1', () => {
        test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/profile/1')
                .expect('Content-Type', /json/)
                .expect(200);
        }));
    });
    // usersRouter.put('/update_user/:id',httpUpdateUser);
    describe('Test PUT /update_user/:id', () => {
        name = "Lpkyrius GMail";
        cpf = "00671067737";
        let userData = {
            name: name,
            cpf: cpf
        };
        describe('Test PUT /update_user/:id bad format name', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.name = "test#$";
                userData.cpf = cpf;
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user/1')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test PUT /update_user/:id blank name', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.name = "";
                userData.cpf = cpf;
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user/1')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test PUT /update_user/:id blank cpf', () => {
            test('It should respond with 400 bad request + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.name = name;
                userData.cpf = "";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user/1')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test PUT /update_user/:id', () => {
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.name = name;
                userData.cpf = cpf;
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user/1')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(200);
                expect(response.body).toMatchObject(userData);
            }));
        });
    });
    // usersRouter.put('/confirm_email/:id/:uniqueString', handleEmailConfirmation);
    describe('Test GET /confirm_email/:id/:uniqueString', () => {
        describe('Test GET /confirm_email/:id/:uniqueString general test', () => {
            test('It should respond with 200 + Content-Type = html', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .get('/confirm_email/1/9a405464-bc99-4dc5-bf8d-1c5a596bf3b383')
                    .expect('Content-Type', "text/plain; charset=utf-8")
                    .expect(302);
                // .end((err, res) => {
                //     if (err) return done(err);
                //     // Make another request to the redirected URL
                //     request(app)
                //       .get(res.headers.location)
                //       .expect('Content-Type', /html/)
                //       .expect(200)
                //       .expect(/<p class="error">/) // This checks if the body contains the error message
                //       .end(done);
                //   });
            }));
        });
        // Since it sends a HTML file with success or error message, there is way to test it.
        // describe('Test GET /confirm_email/:id/:uniqueString with id that does not exist', () => {
        //     test('It should respond with 400 fail + Content-Type = json', async () => {
        //         const response = await request(app)
        //             .get('/confirm_email/0/:uniqueString')
        //             .expect('Content-Type', /json/)
        //             .expect(400);
        //     });
        // });
        // describe('Test GET //confirm_email/:id/:uniqueString with a valid id', () => {
        //     test('It should respond with 200 success + Content-Type = json', async () => {
        //         const response = await request(app)
        //             .get('/confirm/83/3de13c32-8aeb-4774-b040-0270d783d5e883')
        //             .expect('Content-Type', /json/)
        //             .expect(200);
        //     });
        // });
    });
    // usersRouter.put('/update_user_email/:id',httpUpdateUserEmail);
    describe('Test PUT /update_user_email/:id', () => {
        userData.email = "lpkyrius@gmail.com";
        userData.cpf = "06763865040";
        describe('Test PUT /confirm_email/:id with an email already used', () => {
            test('It should respond with 409 conflict + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user_email/2')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(409);
            }));
        });
        describe('Test PUT /update_user_email/:id with bad format email', () => {
            test('It should respond with 400 fail + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.email = "lpkyriusgmail.com";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user_email/1')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(400);
            }));
        });
        describe('Test PUT /update_user_email/:id with an id that does not exist', () => {
            test('It should respond with 404 not found + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.email = "lpkyrius@zmail.com";
                userData.cpf = "573.761.058-67";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user_email/0')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(404);
            }));
        });
        describe('Test PUT /update_user_email/:id with a valid email', () => {
            test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
                userData.email = "lpkyrius@gmail.com";
                userData.cpf = "00671067737";
                const response = yield (0, supertest_1.default)(app_1.default)
                    .put('/update_user_email/1')
                    .send(userData)
                    .expect('Content-Type', /json/)
                    .expect(200);
            }));
        });
    });
});
