const Vote = require('../models/Vote');

// Adds "userVote" (1, -1 or 0) to each post, using ONE query for all posts on the page
const addUserVotes = async (posts, userId) => {
  if (!userId || posts.length === 0) {
    return posts.map((post) => ({ ...post, userVote: 0 }));
  }

  const votes = await Vote.find({ user: userId, post: { $in: posts.map((p) => p._id) } }).lean();
  const voteByPost = new Map(votes.map((v) => [String(v.post), v.value]));

  return posts.map((post) => ({ ...post, userVote: voteByPost.get(String(post._id)) || 0 }));
};

module.exports = addUserVotes;