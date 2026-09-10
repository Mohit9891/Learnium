require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db.js');
const passport = require('./src/config/passport.js');
const { notFound, errorHandler } = require('./src/middleware/errorHandler.js');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = ['http://localhost:5173', 'https://www.learnium.in', process.env.FRONTEND_URL].filter(
  (o, i, arr) => o && arr.indexOf(o) === i
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / curl / mobile (no Origin header) and whitelisted web origins.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);

app.use(passport.initialize());

// Basic abuse protection: 300 req / 15 min per IP globally, stricter on auth.
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true });
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/mistakes', require('./src/routes/mistakeRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api', require('./src/routes/catalogRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/questionRoutes'));

app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
  }
  await connectDB();
  app.listen(PORT, () => console.log(`Learnium backend running on port ${PORT}`));
}

if (require.main === module) {
  start();
}

module.exports = app;
