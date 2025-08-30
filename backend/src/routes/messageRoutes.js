import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:id/messages", async (req, res) => {
  const { id: conversationId } = req.params;
  const userId = req.user.id;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "username");

    res.json(messages);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
