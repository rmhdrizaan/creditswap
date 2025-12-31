import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../config/jwt.js";

const formatUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role, // Important for Navbar
  credits: user.credits,
  avatar: user.avatar,
  token: generateToken(user._id),
});

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      credits: 50,
      role: "user", // Default role
    });

    res.status(201).json(formatUserResponse(user));
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};