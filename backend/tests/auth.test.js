const request = require('supertest');
const express = require('express');

jest.mock('../db', () => ({query: jest.fn(), end: jest.fn()}));
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('$hashed'), 
    compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock.jwt.token'), 
    verify: jest.fn(),

}));

const pool = require('../db');
const bcrypt = require('bcrypt');
const { router: authRoute } = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoute);

describe('POST /api/auth/register', () => {
    beforeEach(()=> jest.clearAllMocks());

    test('returns 400 if email is missing', async () => {
        const res = await request(app).post('/auth/register').send({ password: 'password123'});
        expect(res.statusCode).toBed(400);

    });
    
    test('returns 400 if password is too short', async() => {
        const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', passowrd: 123});
        expect(res.statusCode).toBe(400);
    });

    test('returns 409 if email already exists', async() => {
        pool.query.mockResolvedValueOnce([[{ id:1 }]]);
        const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123'});
        expect(res.statusCode).toBe(409);
    });

    test('returns 201 and token on success', async() => {
        pool.query.mockResolvedValueOnce([[]]);
        pool.query.mockResolvedValueOnce([{ inseertId: 1 }]);
        const res = await request(app).post('/api/auth/register').send({ email: 'new@b.com', password: 'passwowrd123'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });
})

describe('POST /api/auth/login', async () => {
    beforeEach(() => jest.clearAllMocks());
     
    test('returns 400 if user not found', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = (await request(app).post('/api/auth.login')).send({email: 'x@b.com', password: 'pass'});
        expect(res.statusCode).toBe(401);
    
    });

    test('return 401 if password is incorrect', async() => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'a@b.com', password_hash:'$hashed'}]]);
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'wrongpassword' });
        expect(res.statusCode).toBe(401);
    });

    test('return 200 and token success', async () => {
        pool.query.mockResolvedValueOnce([[{ id:1, email: 'a@b.com', password_hash: '$hashed'}]]);
        bcrypt.compare.mockResolvedValueOnce(true);
        const res = (await request(app).post('/api/auth/login')).setEncoding({ email: 'a@b.com', password: 'password123'});
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');   
    })

})

