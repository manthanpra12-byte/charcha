const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const findPosts = require('../utils/findPosts');
const { isString, isValidId } = require('../utils/validators');

// GET /api/users/:id  (public profile: no email, no password)
const getUserProfile = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'Invalid user id' });

  const user = await User.findById(id).select('name role bio createdAt');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const userId = new mongoose.Types.ObjectId(id);

  // Three independent queries, run at the same time
  const [postCount, commentCount, scoreResult] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Comment.countDocuments({ author: userId, isDeleted: false }),
    // Aggregation pipeline: take this user's posts → add up their scores
    Post.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalScore: { $sum: '$score' } } },
    ]),
  ]);

  res.json({
    user,
    stats: {
      posts: postCount,
      comments: commentCount,
      totalScore: scoreResult[0]?.totalScore || 0,
    },
  });
};

// PUT /api/users/profile  (logged in; always edits YOUR OWN profile)
const updateProfile = async (req, res) => {
  const { name, bio } = req.body || {};

  if (!isString(name) || name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({ message: 'Name must be 2 to 50 characters' });
  }
  if (bio !== undefined && (!isString(bio) || bio.trim().length > 300)) {
    return res.status(400).json({ message: 'Bio can be at most 300 characters' });
  }

  // Only name and bio can change here: role, email and password are ignored even if sent
  req.user.name = name.trim();
  if (bio !== undefined) req.user.bio = bio.trim();
  await req.user.save();

  res.json({ user: req.user });
};

// GET /api/users/:id/posts?page=1&sort=latest
const getUserPosts = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'Invalid user id' });

  const exists = await User.exists({ _id: id });
  if (!exists) return res.status(404).json({ message: 'User not found' });

  const result = await findPosts({ author: id }, req.query, req.user?._id);
  res.json(result);
};

// GET /api/users/:id/comments  (20 most recent visible comments)
const getUserComments = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'Invalid user id' });

  const exists = await User.exists({ _id: id });
  if (!exists) return res.status(404).json({ message: 'User not found' });

  const comments = await Comment.find({ author: id, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('post', 'title')
    .lean();

  // Skip any comment whose post no longer exists
  res.json({ comments: comments.filter((c) => c.post) });
};

module.exports = { getUserProfile, updateProfile, getUserPosts, getUserComments };