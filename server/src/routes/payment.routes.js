import express from 'express';
import protect from '../middleware/auth.middleware.js'; // ✅ FIX
import {
  purchaseCredits,
  getPaymentHistory,
  getCreditPackages
} from '../controllers/payment.controller.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// POST /api/payments/purchase
router.post('/purchase', purchaseCredits);

// GET /api/payments/history
router.get('/history', getPaymentHistory);

// GET /api/payments/packages
router.get('/packages', getCreditPackages);

export default router;