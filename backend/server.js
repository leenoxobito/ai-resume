const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyseRoute = require('./routes/analyse');
const updateRoute = require('./routes/update');
const  { router: authRoute} = require('./routes/auth');
const {generalLimiter, analyseLimiter,authLimiter} = require('./middleware/rateLimiter');

const app = express();

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json({limit: '10mb'}));
app.use(generalLimiter);

app.use((req, _res, next) => {
  console.log(`(${new Date().toISOString()}) ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/analyse', analyseRoute);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ error: 'An unexpected error has occrured'});
});

const PORT = precess.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on https://localhost:${PORT}`));
module.exports = app;