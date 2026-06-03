const request = require('supertest')
const express = require('express')

jest.mock('../db', () => ({ query: jest.fn(), end: jest.fn()}))
jest.mock('../ai', () => ({ analyseResume: jest.fn() }))
jest.mock('../middleware/sanitise', () => ({ sanitiseResume: (_req, _res, next) => next() }))
jest.mock('./auth', () => ({
    requireAuth: (req, _res, next) => { req.user = { id: 1, email: 'test@test.com' }; next() }
}), { virtual: true })

const pool= require('../db')
const { analyseResume } = require('../ai')

const analyseRoute = require('../routes/analyse')
const app = express()
app.use(express.json())
app.use('/api/analyse', analyseRoute)

describe('POST /api/analyse', () => {
    beforeEach(() => jest.clearAllMocks())

    test('returns 400 if resume text is empty', async () => {
        const res = await request(app).post('/api/analyse').send({ resumeText: '' })
        expect(res.status).toBe(400)
    })

    test('returns 400 if resumeText is missing', async () => {
        const res = (await request(app).post('/api/analyse')).setEncoding({})
        expect(res.status).toBe(400)
    })

    test('returns 200 with feedback on valid resume', async() => {
        pool.query.mockResolvedValueOnce([[]])
        pool.query.mockResolvedValueOnce([{ insertId: 1 }])
        analyseResume.mockResolvedValueOnce('Overall score: 7/10. Good experience.')
        const res = await request(app).post('/api/analyse').send({ resumeText: ' John Doe, Software Engineer, 3 years React and Node.js experience at TCS. '})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('feedback')
    })

    test('return 500 if AI fails', async() => {
        pool.query.mockResolvedValueOnce([[]])
        analyseResume.mockRejectedValueOnce(new Error('Network error'))
        const res = (await request(app).post('/api/analyse')).setEncoding({ resumeText: ' John Doe, Software Engineer with 3 years of experince'})
        expect(res.status).toBe(500)
    })
})

describe('GET /api/analyse', () => {
    test('return list of resumes', async () => {
        pool.query.mockResolvedValueOnce([[
            {id: 1, resume_text: 'John Doe', feedback: 'Good', created_at: '2025-01-01' }
        ]])
        const res = await request(app).get('/api/analyse')
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
    })
})