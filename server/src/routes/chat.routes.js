import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getUserConversations,
  markAsRead,
  updateConversationStatus,
  getConversation
} from "../controllers/chat.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Inbox
router.get("/inbox", getUserConversations);
router.get("/conversations", getUserConversations); // Alias

// Conversation management
router.post("/start", getOrCreateConversation);
router.get("/:conversationId", getConversation);
router.put("/:conversationId/status", updateConversationStatus);

// Messages
router.get("/:conversationId/messages", getMessages);
router.post("/message", sendMessage);

// Read status
router.put("/read", markAsRead);

export default router;