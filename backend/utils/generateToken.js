const jwt = require('jsonwebtoken');
const config = require('../config/env');

// The token only stores the user's id. Role and other details are read fresh from the database.
const generateToken = (userId) =>
  jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

module.exports = generateToken;