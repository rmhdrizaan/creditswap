import express from "express";
import { getMyTransactions } from "../controllers/transaction.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyTransactions);

export default router;