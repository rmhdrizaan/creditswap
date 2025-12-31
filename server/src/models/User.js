import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    credits: {
      type: Number,
      default: 50,
    },
    // Profile Fields (Phase 1)
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    avatar: { type: String, default: "" }, // URL to image
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);