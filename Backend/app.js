require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth');
const catalogRoutes = require('./src/routes/catalog');
const materialsRoutes = require('./src/routes/materials');
const threadsRoutes = require('./src/routes/threads');
const quizzesRoutes = require('./src/routes/quizzes');
const leaderboardRoutes = require('./src/routes/leaderboard');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const normalizeOrigin = (value = '') => value.trim().replace(/\/$/, '');

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (curl, Postman) with no Origin header.
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && localDevOriginPattern.test(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', catalogRoutes);
app.use('/api/v1', materialsRoutes);
app.use('/api/v1', threadsRoutes);
app.use('/api/v1', quizzesRoutes);
app.use('/api/v1', leaderboardRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`StudyBuddy API running on http://localhost:${PORT}`);
});

module.exports = app;
