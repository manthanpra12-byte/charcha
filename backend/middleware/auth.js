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

  req.user = user; // later handlers can use req.user
  next();
};

// Allows the request only for the listed roles, e.g. authorize('admin')
// Always use AFTER protect
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};

module.exports = { protect, authorize };