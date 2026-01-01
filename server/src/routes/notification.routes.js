import express from "express";
import {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getNotificationStats
} from "../controllers/notification.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/notifications - Get user notifications with pagination
router.get("/", getMyNotifications);

// GET /api/notifications/stats - Get notification statistics
router.get("/stats", getNotificationStats);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put("/:id/read", markRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put("/read-all", markAllRead);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", deleteNotification);

export default router;