const express = require('express');
const { getUserProfile, updateProfile, getUserPosts, getUserComments } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/:id', getUserProfile);
router.get('/:id/posts', optionalAuth, getUserPosts);
router.get('/:id/comments', getUserComments);

module.exports = router;