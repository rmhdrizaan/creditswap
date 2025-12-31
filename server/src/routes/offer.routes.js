import express from "express";
import { createOffer, getListingOffers, acceptOffer, getMyOffers, updateOffer } from "../controllers/offer.controller.js";
import protect from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/my", protect, getMyOffers); // <--- New Route
router.post("/:listingId", protect, createOffer);
router.put("/:listingId", protect, updateOffer); // <--- New Route
router.get("/listing/:listingId", protect, getListingOffers);
router.put("/:id/accept", protect, acceptOffer);

export default router;