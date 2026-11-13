const Comment = require('../models/Comment');
const Post = require('../models/Post');
const buildCommentTree = require('../utils/buildCommentTree');
const { isString, isValidId } = require('../utils/validators');

// GET /api/comments/post/:postId
const getPostComments = async (req, res) => {
  const { postId } = req.params;
  if (!isValidId(postId)) return res.status(400).json({ message: 'Invalid post id' });

  const postExists = await Post.exists({ _id: postId });
  if (!postExists) return res.status(404).json({ message: 'Post not found' });

  // ONE query for all comments of the post, oldest first
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: 1 })
    .populate('author', 'name')
    .lean();

  // Deleted comments keep their place in the thread, but show no text or author
  const safeComments = comments.map((c) =>
    c.isDeleted ? { ...c, content: '[deleted]', author: null } : c
  );

  res.json({
    comments: buildCommentTree(safeComments),
    total: comments.filter((c) => !c.isDeleted).length,
  });
};

// POST /api/comments   body: { postId, content, parentCommentId? }
const createComment = async (req, res) => {
  const { postId, content, parentCommentId } = req.body || {};

  if (!isString(content) || !content.trim() || content.trim().length > 2000) {
    return res.status(400).json({ message: 'Comment must be 1 to 2,000 characters' });
  }
  if (!isValidId(postId)) return res.status(400).json({ message: 'Invalid post id' });

  const postExists = await Post.exists({ _id: postId });
  if (!postExists) return res.status(404).json({ message: 'Post not found' });

  // Optional: this comment is a reply to another comment
  let parent = null;
  if (parentCommentId !== undefined && parentCommentId !== null) {
    if (!isValidId(parentCommentId)) return res.status(400).json({ message: 'Invalid parent comment id' });

    parent = await Comment.findById(parentCommentId);
    if (!parent) return res.status(404).json({ message: 'Parent comment not found' });
    if (String(parent.post) !== String(postId)) {
      return res.status(400).json({ message: 'Parent comment belongs to a different post' });
    }
    if (parent.isDeleted) {
      return res.status(400).json({ message: 'You cannot reply to a deleted comment' });
    }
  }

  const comment = await Comment.create({
    content: content.trim(),
    post: postId,
    author: req.user._id,
    parentComment: parent ? parent._id : null,
  });

  await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } }, { timestamps: false });
  await comment.populate('author', 'name');

  res.status(201).json({ comment });
};

// DELETE /api/comments/:id   (owner or admin)
const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.isDeleted) return res.status(400).json({ message: 'Comment is already deleted' });

  const isOwner = comment.author.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'You can only delete your own comments' });
  }

  const hasReplies = await Comment.exists({ parentComment: comment._id });

  if (hasReplies) {
    // Soft delete: keep the comment so its replies stay in place, but erase the text
    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();
  } else {
    // Hard delete: nothing depends on it
    await comment.deleteOne();
  }

  // commentCount = number of visible (not deleted) comments
  await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } }, { timestamps: false });

  res.json({ message: 'Comment deleted', softDeleted: Boolean(hasReplies) });
};

module.exports = { getPostComments, createComment, deleteComment };