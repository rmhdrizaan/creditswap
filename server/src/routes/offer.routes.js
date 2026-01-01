import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  createOffer,
  updateOffer,
  getMyOffers,
  getListingOffers,
  acceptOffer,
} from "../controllers/offer.controller.js";

const router = express.Router();

router.get("/my", protect, getMyOffers);
router.get("/listing/:listingId", protect, getListingOffers);
router.post("/:listingId", protect, createOffer);
router.put("/:listingId", protect, updateOffer);
router.post("/:id/accept", protect, acceptOffer); // 🔥 POST

export default router;
