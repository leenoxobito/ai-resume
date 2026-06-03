const express = require('express')
const router = express.Router()
const pool = require('../db')
const { analyseResume} =require('../ai')
const { requireAuth } = require('./auth')
const { sanitiseResume } = require('../middleware/sanitise')

const validateResume = (req, res, next) => {
    const { resumeText } = req.body
    if (!resumeText || typeof resumeText !== 'string')
        return res.status(400).json({ error: 'Resume text is required'})
    if (resumeText.trim().length < 50)
        return res.status(400).json({ error: 'Resume text is too short. Paste the full resume text.'})
    if (resumeText.trim().length > 5000)
        return res.status(400).json({ error: 'Resume text is too long. keep it under 5000 characters.'})
    next()
}

const notifyN8n = (payload) => {
    if (!process.env.N8N_WEBHOOK_URL) return
    fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    }).catch(err => console.error('[n8n webhook failed]', err.message))
}

router.post('/', requireAuth, sanitiseResume, validateResume, async (req, res, next) => {
    const { resumeText } = req.body

    try{
        const[pastResumes] = await pool.query(
            'SELECT resume FROM resumees ORDER BY created_at DESC LIMIT 10'
    )
    
    const feedback = await analyseResume(resumeText, pastResumes)

    const [result] = await pool.query(
        'INSERT INTO resumes (resume_text, feedback, user_id) VALUES (?, ?, ?)',
        [resumeText, feedback, req.user.id]
    )

    const resumeId = result.insertId
    
    notifyN8n({ 
        resumeId,
        resumeText,
        userId: req.user.id,
        feedback,
    })

    res.status(200).json({
        message: 'Resume analysed successfully!',
        id: resumeId,
        feedback,
    })
    }
    catch(err){
        if (
            err.message.includes('too short') ||
            err.message.includes('API key') ||
            err.message.includes('empty response')
            ) return res.status(400).json({ error: err.message})
        
        if (err.status === 401)
            return res.status(500).json({ error: 'Invalid API key. Check your .env file.' })
        if (err.status === 429)
            return res.status(500).json({ error: 'Too many requests. Wait a moment and try again.'})
        next(err)
    }
})

router.get('/', requireAuth, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, resume_text, feedback, created_at
            FROM resumes
            WHERE user_id=?
            ORDER BY created_at DESC`
            [req.user.id]
        )
        res.status(200).json({ resumes: rows})
    } catch (err) { next(err) }
})

router.delete('/:id/', requireAuth, async (req, res, next) => {
    const { id } = req.params
    if(!id || isNaN(id))
        return res.status(400).json({ error:'Invalid resume ID'})
    try{ 
        const [result] = await pool.query(
            'DELETE FROM resumes WHERE id=? AND user_id=?',
            [id, req.user.id]
        )
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Resume not found' })

        res.status(200).json({ message: 'Resume deleted successfully'})
    } catch (err) { next(err) }
})

module.exports = router