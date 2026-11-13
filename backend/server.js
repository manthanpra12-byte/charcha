const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const config = require('./config/env'); // load configuration first
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. App settings
app.set('trust proxy', 1); // behind a proxy (Vite locally, Nginx on AWS): use the real client IP

// 2. Security and parsing middleware (runs on every request, in this order)
app.use(helmet());                         // security headers
app.use(express.json({ limit: '10kb' }));  // read JSON bodies, reject huge ones

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300, // general limit: 300 requests per IP per 15 minutes
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
app.use('/api', apiLimiter);

// 3. Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    database: mongoose.connection.name,
    dbConnected: mongoose.connection.readyState === 1,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes);

// 4. Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// 5. Start: connect to the database first, then accept requests
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Charcha API running in ${config.nodeEnv} mode on port ${config.port}`);
  });
});