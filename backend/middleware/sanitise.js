const validator = require('validator');

const sanitiseResume = (req, _res, next) => {
    if(req.body.resumeText){
        req.body.resumeText = validator.stripLow(
            req.body.resumeText.replace(/<[^>]*>/g, ''),
            true
        ).trim();
    }
    next();
};

const sanitiseAuth = (req, _res, next) => {
    if (req.body.email){
        req.body.email = req.body.email.trim().toLowerCase();
        if(!validator.isEmail(req.body.email)){
            return _res.status(400).json({ error: 'Invalid email address"'});
        }
    }
    next();
}

module.exports = { sanitiseResume, sanitiseAuth};