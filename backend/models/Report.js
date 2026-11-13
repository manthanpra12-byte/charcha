const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: ['spam', 'abuse', 'misinformation', 'off-topic', 'other'],
      required: [true, 'Report reason is required'],
    },
    details: { type: String, trim: true, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });             // admin dashboard: pending first
reportSchema.index({ post: 1, reportedBy: 1 }, { unique: true }); // a user reports a post only once

module.exports = mongoose.model('Report', reportSchema);