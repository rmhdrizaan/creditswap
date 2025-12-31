import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Offer from "../models/Offer.js";

// Get Public Profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get their active jobs (what they are working on)
    const activeOffers = await Offer.find({ worker: user._id, status: "accepted" });
    const activeJobIds = activeOffers.map(o => o.listing);
    
    const activeJobs = await Listing.find({ 
      _id: { $in: activeJobIds }, 
      status: "in-progress" 
    }).select("title credits");

    // Get their completed jobs (portfolio)
    const completedOffers = await Offer.find({ worker: user._id, status: "accepted" });
    const completedJobIds = completedOffers.map(o => o.listing);
    
    const completedJobs = await Listing.find({ 
      _id: { $in: completedJobIds }, 
      status: "completed" 
    }).select("title credits");

    res.json({
      ...user._doc,
      activeJobs,
      completedJobsCount: completedJobs.length,
      earnings: completedJobs.reduce((acc, job) => acc + job.credits, 0)
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};