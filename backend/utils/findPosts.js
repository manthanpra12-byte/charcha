const Post = require('../models/Post');
const { isString } = require('./validators');

// Used by GET /api/posts and GET /api/topics/:id/posts
const findPosts = async (filter, query) => {
  // Pagination: which page, and how many posts per page (max 50)
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);

  // Sorting: "popular" = highest score first; otherwise newest first
  const sort = query.sort === 'popular' ? { score: -1, createdAt: -1 } : { createdAt: -1 };

  // Search: uses the text index on title + content
  if (isString(query.search) && query.search.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  // Run both queries at the same time: one page of posts + total count
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name')
      .populate('topic', 'title'),
    Post.countDocuments(filter),
  ]);

  return { posts, page, totalPages: Math.ceil(total / limit) || 1, total };
};

module.exports = findPosts;