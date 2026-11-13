const config = require('../config/env');

// Runs when no route matched
const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Runs when any route throws an error. Turns errors into clean JSON responses.
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Server error';

  // Mongoose schema validation failed (e.g. title too short)
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Invalid MongoDB id in the URL, e.g. /api/posts/abc
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  }

  // Unique index violation (duplicate email, duplicate topic title, duplicate vote)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'Value';
    message = `${field} already exists`;
  }

  // Unexpected server errors: log the details, and hide them from users in production
  if (status === 500) {
    console.error(err);
    if (config.nodeEnv === 'production') message = 'Something went wrong';
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };