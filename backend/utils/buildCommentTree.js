// Turns a flat, oldest-first list of comments into a tree:
// [{ ...comment, replies: [{ ...reply, replies: [...] }] }]
const buildCommentTree = (comments) => {
  const byId = new Map();
  const roots = [];

  // 1st pass: index every comment by its id and give it an empty replies list
  for (const comment of comments) {
    byId.set(String(comment._id), { ...comment, replies: [] });
  }

  // 2nd pass: attach each comment to its parent, or make it a top-level comment
  for (const comment of byId.values()) {
    const parentId = comment.parentComment ? String(comment.parentComment) : null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).replies.push(comment);
    } else {
      roots.push(comment);
    }
  }

  return roots;
};

module.exports = buildCommentTree;