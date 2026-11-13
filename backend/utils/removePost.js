const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const Topic = require('../models/Topic');

// Deletes a post together with its comments and votes, and updates the topic's post count.
// Reports are NOT touched here; each caller decides what happens to them.
const removePostAndData = async (post) => {
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    Vote.deleteMany({ post: post._id }),
  ]);
  await post.deleteOne();
  await Topic.updateOne({ _id: post.topic }, { $inc: { postCount: -1 } });
};

module.exports = removePostAndData;