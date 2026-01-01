import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required. Please login to continue." 
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with all necessary fields
    const user = await User.findById(decoded.userId).select("_id username email role credits bio skills avatar");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found. Please login again." 
      });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      credits: user.credits,
      bio: user.bio,
      skills: user.skills,
      avatar: user.avatar
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please login again." 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Session expired. Please login again." 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: "Authentication failed. Please try again." 
    });
  }
};

export default protect;