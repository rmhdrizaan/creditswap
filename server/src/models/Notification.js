import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    type: { 
      type: String, 
      enum: ["offer_received", "offer_accepted", "job_completed"], 
      required: true 
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // Listing ID
    message: { type: String },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);