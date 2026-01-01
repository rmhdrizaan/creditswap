import jwt from "jsonwebtoken";
import User from "../models/User.js"; // IMPORTANT

const protect = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 IMPORTANT: fetch full user
    const user = await User.findById(decoded.userId).select("_id username email");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ THIS is what your controllers expect
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;
