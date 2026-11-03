import User from "../models/User.js";

// GET /api/users  (protected)
// Returns every registered user except the one who is logged in.
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("username email createdAt")
      .sort({ username: 1 });

    res.json(users);
  } catch (err) {
    next(err);
  }
};