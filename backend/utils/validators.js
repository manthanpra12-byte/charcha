// Checking the type is important: it blocks NoSQL injection like { "email": { "$ne": "" } }
const isString = (value) => typeof value === 'string';

const isValidEmail = (email) =>
  isString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// At least 8 characters, with at least one letter and one number
const isStrongPassword = (password) =>
  isString(password) && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

module.exports = { isString, isValidEmail, isStrongPassword };