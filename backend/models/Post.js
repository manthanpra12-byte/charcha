const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: 10000,
    },
    postType: {
      type: String,
      enum: ['discussion', 'question'],
      default: 'discussion',
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, default: 0 },        // sum of all votes
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ topic: 1, createdAt: -1 });   // posts of a topic, newest first
postSchema.index({ author: 1, createdAt: -1 });  // posts on a user's profile
postSchema.index({ createdAt: -1 });             // "Latest" feed
postSchema.index({ score: -1, createdAt: -1 });  // "Popular" feed
postSchema.index({ title: 'text', content: 'text' }); // search

module.exports = mongoose.model('Post', postSchema);