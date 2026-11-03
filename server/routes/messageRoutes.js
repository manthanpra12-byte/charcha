import express from "express";
import { getConversation, markAsRead } from "../controllers/messageController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protect, getConversation);
router.patch("/:userId/read", protect, markAsRead);

export default router;