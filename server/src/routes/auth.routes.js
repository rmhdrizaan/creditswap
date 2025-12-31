import express from "express";
import { register, login, getCurrentUser } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", register);
router.post("/login", login);

// Protected route
router.get("/me", auth, getCurrentUser);

export default router;