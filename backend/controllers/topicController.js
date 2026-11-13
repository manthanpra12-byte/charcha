const Topic = require('../models/Topic');
const findPosts = require('../utils/findPosts');
const { isString, escapeRegex } = require('../utils/validators');

// GET /api/topics?search=cloud
const getTopics = async (req, res) => {
  const filter = {};
  if (isString(req.query.search) && req.query.search.trim()) {
    filter.title = { $regex: escapeRegex(req.query.search.trim()), $options: 'i' }; // case-insensitive
  }

  const topics = await Topic.find(filter).sort({ title: 1 }).populate('createdBy', 'name');
  res.json({ topics });
};

// GET /api/topics/:id
const getTopicById = async (req, res) => {
  const topic = await Topic.findById(req.params.id).populate('createdBy', 'name');
  if (!topic) return res.status(404).json({ message: 'Topic not found' });
  res.json({ topic });
};

// POST /api/topics  (logged in)
const createTopic = async (req, res) => {
  const { title, description } = req.body || {};

  if (!isString(title) || title.trim().length < 3 || title.trim().length > 50) {
    return res.status(400).json({ message: 'Topic title must be 3 to 50 characters' });
  }
  if (!isString(description) || !description.trim() || description.trim().length > 500) {
    return res.status(400).json({ message: 'Description is required (max 500 characters)' });
  }

  // Case-insensitive duplicate check: "gaming" = "Gaming"
  const existing = await Topic.findOne({ title: title.trim() }).collation({ locale: 'en', strength: 2 });
  if (existing) {
    return res.status(409).json({ message: 'A topic with this title already exists' });
  }

  const topic = await Topic.create({
    title: title.trim(),
    description: description.trim(),
    createdBy: req.user._id,
  });

  res.status(201).json({ topic });
};

// GET /api/topics/:id/posts?sort=latest&page=1
const getTopicPosts = async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const result = await findPosts({ topic: topic._id }, req.query, req.user?._id);
  res.json(result);
};

module.exports = { getTopics, getTopicById, createTopic, getTopicPosts };