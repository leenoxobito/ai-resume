const request = require('supertest');
const express = require('express');

jest.mock('pdf-parse', () => jest.fn());
const pdfparse = require('pdf-parse')

const uploadRoute = require('../routes/upload')
const app = express()
app.use('/api/upload', uploadRoute)

describe("POST /api/upload", () => {
    beforeEach(() => jest.clearAllMocks())

    test('returns 400 if no file attached', async () => {
        const res = await request(app).post('/api/upload')
        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBeDefined()
    })

    test('returns 200 with extracted text on valid PDF', async () => {
        pdfparse.mockResolvedValueOnce({
            text: 'John Doe, Software Engineer with 5 years of React and Node.js experience.',
            numpages: 1,
        })
        const res = await request(app)
            .post('/api/upload')
            .attach('resume', Buffer.from('%PDF-1.4 mock'), 'resume.pdf')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('text')
        expect(res.body).toHaveProperty('pages')
    })

    test('returns 400 if extracted text is too short', async () => {
        pdfParse.mockResolvedValueOnce({ text: 'too short', numpages: 1})
        const res = await request(app)
            .post('/api/upload')
            .attach('resume', Buffer.from('PDF-1.4 mock'), 'resume.pdf')
        expect(res.statusCode).toBe(400)
        })
})
