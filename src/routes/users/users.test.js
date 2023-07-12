const request = require('supertest');
const app = require('../../app');

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

