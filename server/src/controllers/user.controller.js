import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Offer from "../models/Offer.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get Active Jobs (In Progress)
    const activeOffers = await Offer.find({ worker: user._id, status: "accepted" });
    const activeJobIds = activeOffers.map(o => o.listing);
    const activeJobs = await Listing.find({ 
      _id: { $in: activeJobIds }, 
      status: "in-progress" 
    }).select("title credits");

    // Get Completed Jobs
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

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio || user.bio;
      user.skills = req.body.skills || user.skills; // Expecting an array of strings
      
      // If we had an avatar upload, it would go here. 
      // For now, we can allow a URL string or keep the initial generator.
      
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        credits: updatedUser.credits,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};