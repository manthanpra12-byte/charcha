// Usage: node scripts/makeAdmin.js someone@example.com
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.log('No user found with that email');
  } else {
    user.role = 'admin';
    await user.save();
    console.log(`${user.email} is now an admin`);
  }

  await mongoose.disconnect();
};

run();