const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    message: { error: 'Too many requests, Please wait for 15minutes and try again.'},
    standardHeaders: true,
    legacyHeaders: false,
});

const analyseLimiter = rateLimit({
    windowMs: 10*60*1000,
    max: 20,
    message: { error: 'You have reached the analysis limit. Please wait for 1 hour and try again.'},
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 10,
    message: {error: 'Too many Login attempts, Please wait for 15minutes and try again.'},
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, analyseLimiter, authLimiter};
