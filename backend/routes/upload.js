const express = require('express')
const router = express.Router()
const multer = require('multer')
const pdfParse = require('pdf-parse')

const storage = multer.memoryStorage()

const upload = multer({
    storage, 
    limits: { fileSize: 10 * 1024 * 1024},
    filesFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf'){
            return cb(new Error('Only PDF files are allowed'))
        }
        cb(null, true)
    },
})

router.post('/', upload.single('resume'), async (req, res, next) => {
    if (!req.file){
        return res.status(400).json({error: 'No file uploaded. Please attach a PDF.' })
    }
    try {
        const parsed = await pdfParse(req.file.buffer)

        if (!parsed.text || parsed.text.trim().length < 50){
            return res.status(400).json({
                error: 'Could not extract text from this PDF. Try copy and pasting the text instead.',

            })
        }
        res.status(200).json({
            text: parsed.text.trim(),
            pages: parsed.numpages,
        })
    }catch (err) { next(err)}
})

module.exports = router