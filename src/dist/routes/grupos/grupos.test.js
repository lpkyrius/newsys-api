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
const request = require('supertest');
const app = require('../../app');
describe('Grupos API', () => {
    describe('Test GET /grupos', () => {
        test('It should respond with 200 success + Content-Type = json', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield request(app)
                .get('/grupos')
                .expect('Content-Type', /json/)
                .expect(200);
        }));
    });
    describe('Test POST /grupo', () => {
        test('It should respond with 200 success', () => {
        });
        test('It should catch missing required properties', () => { });
        test('It should catch invalid dates', () => { });
    });
});
