const express = require('express');
const { getPostComments, createComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/post/:postId', getPostComments);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;