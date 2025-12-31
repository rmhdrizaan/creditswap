import express from "express";
import { createOffer, getListingOffers, acceptOffer } from "../controllers/offer.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:listingId", protect, createOffer);
router.get("/listing/:listingId", protect, getListingOffers);
router.put("/:id/accept", protect, acceptOffer);

export default router;