import express from "express";
import { getMyNotifications, markRead } from "../controllers/notification.controller.js";
import protect from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markRead);
export default router;