const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

// Allows the request only if it carries a valid token
const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret); // checks signature and expiry
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid, please log in again' });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: 'User no longer exists' });
  }

  req.user = user;
  next();
};

// For public routes: identifies the user if a valid token is sent, but never blocks the request
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], config.jwtSecret);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Invalid token: just continue as a guest
    }
  }
  next();
};

// Allows the request only for the listed roles, e.g. authorize('admin'). Use AFTER protect.
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};

module.exports = { protect, optionalAuth, authorize };