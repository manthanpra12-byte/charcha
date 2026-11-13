const express = require('express');
const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');
const { votePost } = require('../controllers/voteController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.post('/', protect, createPost);
router.get('/:id', optionalAuth, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/vote', protect, votePost);

module.exports = router;