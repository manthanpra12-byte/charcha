// Usage:
//   node scripts/deleteUser.js someone@example.com         → preview only (nothing is deleted)
//   node scripts/deleteUser.js someone@example.com --yes   → really delete
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const Report = require('../models/Report');

const run = async () => {
  const email = process.argv[2];
  const confirmed = process.argv[3] === '--yes';

  if (!email) {
    console.log('Usage: node scripts/deleteUser.js <email> [--yes]');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.log('No user found with that email');
    await mongoose.disconnect();
    return;
  }

  // ---- Preview: show what will be affected ----
  const posts = await Post.find({ author: user._id });
  const commentCount = await Comment.countDocuments({ author: user._id });
  const voteCount = await Vote.countDocuments({ user: user._id });
  const reportCount = await Report.countDocuments({ reportedBy: user._id });
  const topicCount = await Topic.countDocuments({ createdBy: user._id });

  console.log(`\nUser: ${user.name} <${user.email}> (role: ${user.role})`);
  console.log(`Posts:    ${posts.length}  → deleted, with their comments, votes and reports`);
  console.log(`Comments: ${commentCount}  → replaced with [deleted]`);
  console.log(`Votes:    ${voteCount}  → removed, post scores corrected`);
  console.log(`Reports:  ${reportCount}  → deleted`);
  console.log(`Topics:   ${topicCount}  → kept, transferred to another admin if one exists`);

  if (!confirmed) {
    console.log('\nPreview only. Nothing was deleted. Run again with --yes to delete.');
    await mongoose.disconnect();
    return;
  }

  // ---- 1. Delete the user's posts and everything attached to them ----
  for (const post of posts) {
    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      Vote.deleteMany({ post: post._id }),
      Report.deleteMany({ post: post._id }),
    ]);
    await post.deleteOne();
    await Topic.updateOne({ _id: post.topic }, { $inc: { postCount: -1 } });
  }

  // ---- 2. Undo the user's votes on other people's posts ----
  const votes = await Vote.find({ user: user._id });
  for (const vote of votes) {
    await Post.updateOne({ _id: vote.post }, { $inc: { score: -vote.value } });
  }
  await Vote.deleteMany({ user: user._id });

  // ---- 3. Keep reply threads intact: hide the user's comments instead of deleting them ----
  await Comment.updateMany({ author: user._id }, { content: '[deleted]', isDeleted: true });

  // ---- 4. Remove reports the user filed ----
  await Report.deleteMany({ reportedBy: user._id });

  // ---- 5. Hand the user's topics to another admin ----
  const otherAdmin = await User.findOne({ role: 'admin', _id: { $ne: user._id } });
  if (otherAdmin) {
    await Topic.updateMany({ createdBy: user._id }, { createdBy: otherAdmin._id });
    console.log(`Topics transferred to ${otherAdmin.email}`);
  } else if (topicCount > 0) {
    console.log('Warning: no other admin exists, so the topics keep a reference to the deleted user.');
  }

  // ---- 6. Finally, delete the user ----
  await user.deleteOne();
  console.log(`\nDeleted ${user.email}`);

  await mongoose.disconnect();
};

run();