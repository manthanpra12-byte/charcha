const Report = require('../models/Report');
const Post = require('../models/Post');
const removePostAndData = require('../utils/removePost');
const { isString, isValidId } = require('../utils/validators');

const REASONS = ['spam', 'abuse', 'misinformation', 'off-topic', 'other'];
const STATUSES = ['pending', 'resolved', 'dismissed'];

// POST /api/reports  (logged in)   body: { postId, reason, details? }
const createReport = async (req, res) => {
  const { postId, reason, details } = req.body || {};

  if (!isValidId(postId)) return res.status(400).json({ message: 'Invalid post id' });
  if (!REASONS.includes(reason)) return res.status(400).json({ message: 'Please choose a valid reason' });
  if (details !== undefined && (!isString(details) || details.trim().length > 500)) {
    return res.status(400).json({ message: 'Details can be at most 500 characters' });
  }

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.author.equals(req.user._id)) {
    return res.status(400).json({ message: 'You cannot report your own post' });
  }

  const alreadyReported = await Report.exists({ post: post._id, reportedBy: req.user._id });
  if (alreadyReported) {
    return res.status(409).json({ message: 'You have already reported this post' });
  }

  const report = await Report.create({
    post: post._id,
    postTitle: post.title, // keep the title for the audit trail
    reportedBy: req.user._id,
    reason,
    details: details ? details.trim() : '',
  });

  res.status(201).json({ report });
};

// GET /api/reports?status=pending|resolved|dismissed|all  (admin)
const getReports = async (req, res) => {
  const status = req.query.status || 'pending';
  if (status !== 'all' && !STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status filter' });
  }

  const filter = status === 'all' ? {} : { status };

  const [reports, counts] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: 'post', select: 'title author', populate: { path: 'author', select: 'name' } })
      .populate('reportedBy', 'name')
      .populate('reviewedBy', 'name')
      .lean(),
    // How many reports in each status, for the dashboard tabs
    Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const countByStatus = { pending: 0, resolved: 0, dismissed: 0 };
  counts.forEach((c) => { countByStatus[c._id] = c.count; });

  res.json({ reports, counts: countByStatus });
};

// PATCH /api/reports/:id  (admin)   body: { action: "dismiss" | "remove" }
const reviewReport = async (req, res) => {
  const { action } = req.body || {};
  if (!['dismiss', 'remove'].includes(action)) {
    return res.status(400).json({ message: 'Action must be "dismiss" or "remove"' });
  }

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  if (report.status !== 'pending') {
    return res.status(400).json({ message: 'This report has already been reviewed' });
  }

  const reviewInfo = { reviewedBy: req.user._id, reviewedAt: new Date() };

  if (action === 'dismiss') {
    Object.assign(report, { status: 'dismissed', ...reviewInfo });
    await report.save();
    return res.json({ message: 'Report dismissed' });
  }

  // action === 'remove': delete the post (if it still exists) ...
  const post = await Post.findById(report.post);
  if (post) await removePostAndData(post);

  // ... and resolve EVERY pending report about this post, not just this one
  await Report.updateMany({ post: report.post, status: 'pending' }, { status: 'resolved', ...reviewInfo });

  res.json({ message: 'Post removed and reports resolved' });
};

module.exports = { createReport, getReports, reviewReport };