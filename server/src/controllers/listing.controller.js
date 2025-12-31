import Listing from "../models/Listing.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";




export const getListings = async (req, res) => {
  try {
    // Fetch listings that are 'open', sort by newest
    const listings = await Listing.find({ status: "open" })
      .populate("user", "username avatar") // Add user details
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not fetch listings" });
  }
};

export const getListingById = async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id).populate("user", "username email avatar");
  
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
  
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };

// @desc    Create a new listing
// @route   POST /api/listings
export const createListing = async (req, res) => {
  const { title, description, category, credits } = req.body;

  if (!title || !description || !credits) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    // Optional: Check if user has enough credits to "pay" or just post?
    // For now, we assume users EARN credits by doing jobs, so posting is free/open.

    const listing = new Listing({
      user: req.user._id,
      title,
      description,
      category,
      credits,
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not create listing" });
  }
};

// @desc    Get logged in user's listings
// @route   GET /api/listings/my
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
export const getAssignedListings = async (req, res) => {
    try {
      // Find accepted offers where I am the worker
      const offers = await Offer.find({ worker: req.user._id, status: "accepted" });
      const listingIds = offers.map(o => o.listing);
  
      // Get the listings details
      const listings = await Listing.find({ _id: { $in: listingIds } })
        .populate("user", "username avatar email") // Get Boss details
        .sort({ updatedAt: -1 });
  
      res.json(listings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  // @desc    Finish Job & Pay
  export const completeListing = async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ message: "Listing not found" });
  
      if (listing.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }
  
      if (listing.status !== "in-progress") {
        return res.status(400).json({ message: "Job is not in progress" });
      }
  
      const acceptedOffer = await Offer.findOne({ listing: listing._id, status: "accepted" });
      if (!acceptedOffer) return res.status(400).json({ message: "No worker found" });
  
      // Transaction
      const worker = await User.findById(acceptedOffer.worker);
      const poster = await User.findById(req.user._id);
  
      if (poster.credits < listing.credits) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
  
      poster.credits -= listing.credits;
      worker.credits += listing.credits;
      listing.status = "completed";
  
      await poster.save();
      await worker.save();
      await listing.save();
  
      res.json({ message: "Job Done", credits: poster.credits });
    } catch (error) {
      res.status(500).json({ message: "Transaction failed" });
    }
  };