import Offer from "../models/Offer.js";
import Listing from "../models/Listing.js";

export const createOffer = async (req, res) => {
  try {
    const { message } = req.body;
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot apply to your own job" });
    }

    const existingOffer = await Offer.findOne({ listing: listingId, worker: req.user._id });
    if (existingOffer) {
      return res.status(400).json({ message: "You have already applied" });
    }

    const offer = await Offer.create({
      listing: listingId,
      worker: req.user._id,
      poster: listing.user,
      message,
    });

    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getListingOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ listing: req.params.listingId })
      .populate("worker", "username email avatar credits")
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (offer.poster.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // 1. Mark Offer as Accepted
    offer.status = "accepted";
    await offer.save();

    // 2. Mark Listing as In Progress (CRITICAL STEP)
    await Listing.findByIdAndUpdate(offer.listing, { status: "in-progress" });

    // 3. Reject others
    await Offer.updateMany(
      { listing: offer.listing, _id: { $ne: offer._id } },
      { status: "rejected" }
    );

    res.json({ message: "Worker accepted", offer });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};