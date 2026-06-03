const pool = require('../db')

describe('Database Connection', () => {
    test('should connect to MySQL successfully', async() => {
        const connection = await pool.getConnection()
        expect(connection).toBedDefined()
        connection.release()
    })
    test('should query the resumes table', async() => {
        const [rows] = await pool.query('SELECT * FROM resumes LIMIT 1')
        expect(Array.isArray(rows)).toBe(true)
    })
    afterALL(async() => {
        await pool.end()
    })
})