import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "" }, // 🔥 allow empty safely
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
