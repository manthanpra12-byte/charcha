const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],     // 1 = upvote, -1 = downvote
      required: true,
    },
  },
  { timestamps: true }
);

// One vote per user per post, enforced by the database itself
voteSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);