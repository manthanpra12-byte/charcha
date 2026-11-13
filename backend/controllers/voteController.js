const Post = require('../models/Post');
const Vote = require('../models/Vote');

// POST /api/posts/:id/vote   body: { value: 1 | -1 | 0 }
// 1 = upvote, -1 = downvote, 0 = remove my vote
const votePost = async (req, res) => {
  const { value } = req.body || {};
  if (![1, -1, 0].includes(value)) {
    return res.status(400).json({ message: 'Vote value must be 1, -1 or 0' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const existing = await Vote.findOne({ user: req.user._id, post: post._id });
  const oldValue = existing ? existing.value : 0;

  // Same vote as before: nothing to change
  if (value === oldValue) {
    return res.json({ score: post.score, userVote: value });
  }

  // Save the user's new vote (one document per user per post)
  if (value === 0) {
    await existing.deleteOne();
  } else if (existing) {
    existing.value = value;
    await existing.save();
  } else {
    await Vote.create({ user: req.user._id, post: post._id, value });
    // If two identical requests arrive at the same moment, the unique index
    // { user, post } rejects the second one, so a duplicate vote is impossible
  }

  // Score changes by (new − old). $inc is atomic: safe even with many users voting at once.
  // timestamps: false, so a vote doesn't make the post look "edited"
  const updated = await Post.findByIdAndUpdate(
    post._id,
    { $inc: { score: value - oldValue } },
    { returnDocument: 'after', timestamps: false }
  );

  res.json({ score: updated.score, userVote: value });
};

module.exports = { votePost };