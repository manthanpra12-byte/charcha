const User = require('../models/User');
const Topic = require('../models/Topic');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

// GET /api/admin/stats  (admin)
const getStats = async (req, res) => {
  const [users, topics, posts, comments, pendingReports] = await Promise.all([
    User.countDocuments(),
    Topic.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments({ isDeleted: false }),
    Report.countDocuments({ status: 'pending' }),
  ]);

  res.json({ users, topics, posts, comments, pendingReports });
};

module.exports = { getStats };