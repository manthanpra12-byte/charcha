const mongoose = require('mongoose');

// Checking the type is important: it blocks NoSQL injection like { "email": { "$ne": "" } }
const isString = (value) => typeof value === 'string';

const isValidEmail = (email) =>
  isString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// At least 8 characters, with at least one letter and one number
const isStrongPassword = (password) =>
  isString(password) && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

// True only for a real 24-character MongoDB id
const isValidId = (id) => mongoose.isObjectIdOrHexString(id);

// Makes user text safe to use inside a regular expression search
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { isString, isValidEmail, isStrongPassword, isValidId, escapeRegex };