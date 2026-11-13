const Post = require('../models/Post');
const addUserVotes = require('./addUserVotes');
const { isString } = require('./validators');

// Used by GET /api/posts and GET /api/topics/:id/posts
const findPosts = async (filter, query, userId) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);
  const sort = query.sort === 'popular' ? { score: -1, createdAt: -1 } : { createdAt: -1 };

  if (isString(query.search) && query.search.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name')
      .populate('topic', 'title')
      .lean(), // plain objects, so we can add the userVote field
    Post.countDocuments(filter),
  ]);

  return {
    posts: await addUserVotes(posts, userId),
    page,
    totalPages: Math.ceil(total / limit) || 1,
    total,
  };
};

module.exports = findPosts;