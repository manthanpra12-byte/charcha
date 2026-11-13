// Usage: node scripts/seedTopics.js
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Topic = require('../models/Topic');

const topics = [
  { title: 'Technology', description: 'Gadgets, software, the internet and the latest in tech.' },
  { title: 'Programming', description: 'Languages, frameworks, code reviews and developer life.' },
  { title: 'Artificial Intelligence', description: 'Machine learning, LLMs, research and AI ethics.' },
  { title: 'Cloud Computing', description: 'AWS, Azure, GCP, DevOps and cloud architecture.' },
  { title: 'Education', description: 'Learning resources, exams, courses and teaching.' },
  { title: 'Sports', description: 'Cricket, football and every other game worth discussing.' },
  { title: 'Gaming', description: 'PC, console and mobile games, news and reviews.' },
  { title: 'Career and Jobs', description: 'Interviews, internships, resumes and career advice.' },
];

const run = async () => {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin found. Run: node scripts/makeAdmin.js <email> first.');
    await mongoose.disconnect();
    return;
  }

  for (const t of topics) {
    // Safe to run twice: existing topics are skipped
    const exists = await Topic.findOne({ title: t.title }).collation({ locale: 'en', strength: 2 });
    if (exists) {
      console.log(`Skipped (already exists): ${t.title}`);
      continue;
    }
    await Topic.create({ ...t, createdBy: admin._id });
    console.log(`Created: ${t.title}`);
  }

  await mongoose.disconnect();
};

run();