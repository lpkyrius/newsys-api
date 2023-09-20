import app from '../../app';
import request from 'supertest';

describe('Groups API', () => {
    describe('Test GET /group', () => {
        test('It should respond with 200 success + Content-Type = json', async () => {
            const response = await request(app)
                .get('/group')
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
});