const request = require('supertest');
const app = require('../../app');

describe('Test GET /grupos', () => {
    test('It should respond with 200 success', async () => {
        const response = await request(app)
            .get('/grupos')
            .expect('Content-Type', /json/)
            .expect(200);
    });
});

describe('Test POST /grupo', () => {
    test('It should respond with 200 success', () => {

    });
    
    test('It should catch missing required properties', () => {})
    
    test('It should catch invalid dates', () => {})
});