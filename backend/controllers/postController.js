const Post = require('../models/Post');
const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const Report = require('../models/Report');
const findPosts = require('../utils/findPosts');
const { isString, isValidId } = require('../utils/validators');

const POST_TYPES = ['discussion', 'question'];
const addUserVotes = require('../utils/addUserVotes');

// Returns an error message, or null if the input is valid
const validatePost = ({ title, content, postType }) => {
  if (!isString(title) || title.trim().length < 5 || title.trim().length > 150) {
    return 'Title must be 5 to 150 characters';
  }
  if (!isString(content) || !content.trim() || content.trim().length > 10000) {
    return 'Content is required (max 10,000 characters)';
  }
  if (postType !== undefined && !POST_TYPES.includes(postType)) {
    return 'Post type must be "discussion" or "question"';
  }
  return null;
};

// Replace author/topic ids with their names
const populatePost = (post) =>
  post.populate([
    { path: 'author', select: 'name' },
    { path: 'topic', select: 'title' },
  ]);

// GET /api/posts?sort=popular&page=2&limit=10&search=cloud&topic=<id>
// GET /api/posts?sort=popular&page=2&limit=10&search=cloud&topic=<id>
const getPosts = async (req, res) => {
  const filter = {};
  if (isValidId(req.query.topic)) filter.topic = req.query.topic;

  const result = await findPosts(filter, req.query, req.user?._id);
  res.json(result);
};

// GET /api/posts/:id
const getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name')
    .populate('topic', 'title')
    .lean();
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const [postWithVote] = await addUserVotes([post], req.user?._id);
  res.json({ post: postWithVote });
};

// POST /api/posts  (logged in)
const createPost = async (req, res) => {
  const body = req.body || {};
  const error = validatePost(body);
  if (error) return res.status(400).json({ message: error });

  if (!isValidId(body.topic)) {
    return res.status(400).json({ message: 'Please choose a valid topic' });
  }
  const topicExists = await Topic.exists({ _id: body.topic });
  if (!topicExists) return res.status(404).json({ message: 'Topic not found' });

  const post = await Post.create({
    title: body.title.trim(),
    content: body.content.trim(),
    postType: body.postType || 'discussion',
    topic: body.topic,
    author: req.user._id, // the author always comes from the token, never from the request body
  });

  await Topic.updateOne({ _id: body.topic }, { $inc: { postCount: 1 } });
  await populatePost(post);

  res.status(201).json({ post });
};

// PUT /api/posts/:id  (owner only)
const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  // Ownership check: compare the post's author with the logged-in user
  if (!post.author.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only edit your own posts' });
  }

  const body = req.body || {};
  const error = validatePost(body);
  if (error) return res.status(400).json({ message: error });

  post.title = body.title.trim();
  post.content = body.content.trim();
  if (body.postType) post.postType = body.postType;
  await post.save(); // updatedAt changes automatically

  await populatePost(post);
  res.json({ post });
};

// DELETE /api/posts/:id  (owner or admin)
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const isOwner = post.author.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  // Remove everything that belongs to this post, so no orphan data is left behind
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    Vote.deleteMany({ post: post._id }),
    Report.deleteMany({ post: post._id }),
  ]);
  await post.deleteOne();
  await Topic.updateOne({ _id: post.topic }, { $inc: { postCount: -1 } });

  res.json({ message: 'Post deleted' });
};

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };