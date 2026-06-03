const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')){
        return res.status(401).json({ error: 'Not logged in. Please sign in first.'})
    }
    const token = header.split(' ')[1]
    try { 
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    }catch {
        res.status(401).json({ error: 'Session expired. Please sign in again.'})
    }
}

router.post('/register', async (req, res, next) => {
    const { email, password } = req.body
    
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required. '})
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ error: 'Please enter a valid email address.'})
    if (password.length < 8)
        return res.status(400).json({ error: 'Password must be at least 8 characters' })
    try { 
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?', [email]
        )
        if (existing.length > 0)
            return res.status(409).json({ error: 'An account with this email already exists'})

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

        const [result] = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            [email, passwordHash] 
        )

        const token = jwt.sign({ 
            id: result.insertId,
            email},
            JWT_SECRET,
            { expiresIn: '7d'},
        )
        res.status(201).json({ token, email})
    }catch (err) {
        next(err)
    }
})

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required'})
    try {
        const [rows] =await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        )
        if (rows.length === 0)
            return res.status(401).json({ error: 'Incorrect email or password'})
        const user = rows[0]

        const match = await bcrypt.compare(password, user.password_hash)
        if (!match)
            return res.status(401).json({ error: 'Incorrect email or password'})

        const token = jwt.sign(
            { id: user.id, email: user.email},
            JWT_SECRET,
            { expiresIn: '7d'}
        )
        res.status(200).json({ token, email: user.email})
    } catch (err) { next(err)}

})

router.get('/me', requireAuth, (req, res) => {
    res.status(200).json({ id: req.user.id, email: req.user.email})
})

module.exports = { router, requireAuth}