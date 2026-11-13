const path = require('path');
const dotenv = require('dotenv');

// Load backend/.env no matter which folder the app is started from
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Stop immediately if something important is missing
const required = ['MONGO_URI', 'JWT_SECRET'];
for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

// In production, refuse to run with a weak JWT secret
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is too short for production (minimum 32 characters)');
  process.exit(1);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};