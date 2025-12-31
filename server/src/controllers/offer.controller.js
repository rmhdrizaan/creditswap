import Offer from "../models/Offer.js";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

/* ======================================================
   APPLY FOR A JOB (BID)
   POST /api/offers/:listingId
====================================================== */
export const createOffer = async (req, res) => {
  const { message } = req.body;
  const { listingId } = req.params;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Prevent applying to own job
    if (listing.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot apply to your own job" });
    }

    // Prevent duplicate bids
    const existing = await Offer.findOne({
      listing: listingId,
      worker: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const offer = await Offer.create({
      listing: listingId,
      worker: req.user._id,
      poster: listing.user,
      message,
    });

    // 🔔 Notify job poster
    await Notification.create({
      recipient: listing.user,
      sender: req.user._id,
      type: "offer_received",
      relatedId: listing._id,
      message: `New application for "${listing.title}"`,
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error("Create Offer Error:", error);
    res.status(500).json({ message: "Error applying for job" });
  }
};

/* ======================================================
   EDIT MY BID
   PUT /api/offers/:listingId
====================================================== */
export const updateOffer = async (req, res) => {
  try {
    const { message } = req.body;

    const offer = await Offer.findOne({
      listing: req.params.listingId,
      worker: req.user._id,
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot edit a processed bid" });
    }

    offer.message = message;
    await offer.save();

    res.json(offer);
  } catch (error) {
    console.error("Update Offer Error:", error);
    res.status(500).json({ message: "Error updating bid" });
  }
};

/* ======================================================
   GET MY BIDS (My Bids Page)
   GET /api/offers/my
====================================================== */
export const getMyOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ worker: req.user._id })
      .populate({
        path: "listing",
        select: "title credits status",
        populate: { path: "user", select: "username" },
      })
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    console.error("Get My Offers Error:", error);
    res.status(500).json({ message: "Error fetching bids" });
  }
};

/* ======================================================
   GET APPLICANTS FOR A LISTING
   GET /api/offers/listing/:listingId
====================================================== */
export const getListingOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ listing: req.params.listingId })
      .populate("worker", "username credits avatar");

    res.json(offers);
  } catch (error) {
    console.error("Get Listing Offers Error:", error);
    res.status(500).json({ message: "Error fetching offers" });
  }
};

/* ======================================================
   ACCEPT OFFER (HIRE WORKER)
   POST /api/offers/:id/accept
====================================================== */
export const acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("listing");
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // 🔒 Authorization: only job owner
    if (offer.poster.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    /* =========================
       JOB & OFFER STATE UPDATE
    ========================= */
    offer.status = "accepted";
    await offer.save();

    await Listing.findByIdAndUpdate(offer.listing._id, {
      status: "in-progress",
    });

    await Offer.updateMany(
      { listing: offer.listing._id, _id: { $ne: offer._id } },
      { status: "rejected" }
    );

    /* =========================
       💬 CHAT SYSTEM: ACTIVATE
    ========================= */
    const convo = await Conversation.findOne({
      listing: offer.listing._id,
      participants: { $all: [req.user._id, offer.worker] },
    });

    if (convo) {
      convo.status = "active";
      await convo.save();

      await Message.create({
        conversationId: convo._id,
        sender: null, // system message
        content:
          "🔒 HIRE CONFIRMED. Credits reserved. Full chat features unlocked.",
        type: "system",
      });
    }

    /* =========================
       🔔 NOTIFY WORKER
    ========================= */
    await Notification.create({
      recipient: offer.worker,
      sender: req.user._id,
      type: "offer_accepted",
      relatedId: offer.listing._id,
      message: `You were hired for "${offer.listing.title}"!`,
    });

    res.json({ message: "Worker hired successfully" });
  } catch (error) {
    console.error("Accept Offer Error:", error);
    res.status(500).json({ message: "Error accepting offer" });
  }
};
