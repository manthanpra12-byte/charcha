const express = require('express');
const { getTopics, getTopicById, createTopic, getTopicPosts } = require('../controllers/topicController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getTopics);
router.post('/', protect, createTopic);
router.get('/:id', getTopicById);
router.get('/:id/posts', getTopicPosts);

module.exports = router;
