import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  accessChat,
  fetchChats,
  sendMessage,
  allMessages,
  markAsRead,
  deleteMessage,
  addReaction,
  editMessage,
  getConversation,
  updateConversation,
  getChatStats
} from "../controllers/chat.controller.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Conversation routes
router.route("/")
  .post(accessChat)           // POST /api/chat - Create or access chat
  .get(fetchChats);           // GET /api/chat - Get user's conversations

router.route("/stats")
  .get(getChatStats);         // GET /api/chat/stats - Get chat statistics

router.route("/:conversationId")
  .get(getConversation)       // GET /api/chat/:id - Get conversation details
  .put(updateConversation);   // PUT /api/chat/:id - Update conversation settings

// Message routes
router.route("/message")
  .post(sendMessage);         // POST /api/chat/message - Send message

router.route("/:conversationId/messages")
  .get(allMessages)           // GET /api/chat/:id/messages - Get messages
  .put(markAsRead);           // PUT /api/chat/:id/messages - Mark as read

router.route("/message/:messageId")
  .delete(deleteMessage)      // DELETE /api/chat/message/:id - Delete message
  .put(editMessage);          // PUT /api/chat/message/:id - Edit message

router.route("/message/:messageId/reaction")
  .post(addReaction);         // POST /api/chat/message/:id/reaction - Add reaction

export default router;