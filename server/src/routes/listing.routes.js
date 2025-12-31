import express from "express";
import { getListings, createListing, getMyListings, getListingById } from "../controllers/listing.controller.js";
import protect from "../middleware/auth.middleware.js";
import { completeListing } from "../controllers/listing.controller.js";
import { getAssignedListings } from "../controllers/listing.controller.js";



const router = express.Router();
router.put("/:id/complete", protect, completeListing);
router.get("/", protect, getListings);
router.get("/assigned", protect, getAssignedListings);
router.post("/", protect, createListing);
router.get("/my", protect, getMyListings);
router.get("/:id", protect, getListingById); // <--- Add this line

export default router;