const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isString, isValidEmail, isStrongPassword } = require('../utils/validators');

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!isString(name) || name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({ message: 'Name must be 2 to 50 characters' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (!isStrongPassword(password)) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters and include a letter and a number' });
  }

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  // "role" is NOT taken from req.body, so nobody can register themselves as admin
  const user = await User.create({ name: name.trim(), email, password });

  res.status(201).json({ token: generateToken(user._id), user });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || !isString(password)) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Password is hidden by default, so ask for it explicitly here
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // Same message for "no such user" and "wrong password", so attackers can't discover which emails exist
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: generateToken(user._id), user });
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };