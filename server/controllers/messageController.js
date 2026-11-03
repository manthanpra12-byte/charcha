import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

// GET /api/messages/:userId  (protected)
// Returns the conversation between the logged-in user and :userId, oldest first.
// Optional query: ?limit=50 (max 100)  and  ?before=<ISO date> to load older messages.
export const getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // The logged-in user's id comes from the verified token (req.user),
    // never from the request. So a user can only ever read THEIR OWN conversations.
    const myId = req.user._id;

    const filter = {
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    };

    if (req.query.before) {
      const before = new Date(req.query.before);
      if (typeof req.query.before !== "string" || isNaN(before.getTime())) {
        return res.status(400).json({ message: "Invalid 'before' date" });
      }
      filter.createdAt = { $lt: before };
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    // Newest first in the query (uses our index), then reverse so the chat reads top to bottom
    const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    next(err);
  }
};

// PATCH /api/messages/:userId/read  (protected)
// Marks all messages SENT BY :userId TO ME as read.
export const markAsRead = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const result = await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, readStatus: false },
      { readStatus: true }
    );

    res.json({ updated: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};