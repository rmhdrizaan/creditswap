import Listing from "../models/Listing.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

/* ======================================================
   GET MARKET FEED (Exclude my own jobs)
   GET /api/listings
====================================================== */
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      status: "open",
      user: { $ne: req.user._id },
    })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error("Get Listings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   GET MY POSTED JOBS (with hired worker if exists)
   GET /api/listings/my
====================================================== */
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const listingObj = listing.toObject();

        if (listing.status !== "open") {
          const acceptedOffer = await Offer.findOne({
            listing: listing._id,
            status: "accepted",
          }).populate("worker", "username avatar");

          if (acceptedOffer) {
            listingObj.hiredWorker = acceptedOffer.worker;
          }
        }

        return listingObj;
      })
    );

    res.json(enrichedListings);
  } catch (error) {
    console.error("Get My Listings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   CREATE LISTING
   POST /api/listings
====================================================== */
export const createListing = async (req, res) => {
  const { title, description, category, credits } = req.body;

  try {
    const listing = await Listing.create({
      user: req.user._id,
      title,
      description,
      category,
      credits,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error("Create Listing Error:", error);
    res.status(500).json({ message: "Failed to create listing" });
  }
};

/* ======================================================
   GET SINGLE LISTING
   GET /api/listings/:id
====================================================== */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "user",
      "username email avatar"
    );

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    console.error("Get Listing By ID Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   GET JOBS I AM WORKING ON (My Work)
   GET /api/listings/assigned
====================================================== */
export const getAssignedListings = async (req, res) => {
  try {
    const offers = await Offer.find({
      worker: req.user._id,
      status: "accepted",
    });

    const listingIds = offers.map((offer) => offer.listing);

    const listings = await Listing.find({ _id: { $in: listingIds } })
      .populate("user", "username email avatar")
      .sort({ updatedAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error("Get Assigned Listings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   COMPLETE JOB & TRANSFER CREDITS
   POST /api/listings/:id/complete
====================================================== */
export const completeListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    /* 🔒 AUTHORIZATION */
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (listing.status !== "in-progress") {
      return res.status(400).json({
        message: "Job must be in-progress to complete",
      });
    }

    const acceptedOffer = await Offer.findOne({
      listing: listing._id,
      status: "accepted",
    });

    if (!acceptedOffer) {
      return res.status(400).json({ message: "No worker found for this job" });
    }

    const poster = await User.findById(req.user._id);
    const worker = await User.findById(acceptedOffer.worker);

    if (poster.credits < listing.credits) {
      return res.status(400).json({
        message: "Insufficient credits to pay worker",
      });
    }

    /* =========================
       💸 CREDIT TRANSFER
    ========================== */
    poster.credits -= listing.credits;
    worker.credits += listing.credits;

    listing.status = "completed";

    const transaction = await Transaction.create({
      sender: poster._id,
      receiver: worker._id,
      listing: listing._id,
      amount: listing.credits,
      type: "payment",
      status: "success",
    });

    await poster.save();
    await worker.save();
    await listing.save();

    /* =========================
       💬 CHAT → COMPLETED
    ========================== */
    const convo = await Conversation.findOne({
      listing: listing._id,
      participants: { $all: [poster._id, worker._id] },
    });

    if (convo) {
      convo.status = "completed";
      await convo.save();

      await Message.create({
        conversationId: convo._id,
        sender: null, // system message
        content:
          "✅ JOB COMPLETED. Credits released to worker. Chat will archive in 7 days.",
        type: "system",
      });
    }

    res.json({
      message: "Job completed successfully",
      credits: poster.credits,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Complete Listing Error:", error);
    res.status(500).json({
      message: "Transaction failed. Please contact support.",
    });
  }
};
