import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile); // <--- New Route

export default router;