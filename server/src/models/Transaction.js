import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Removed required: true to allow system transactions
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      // Removed required: true to allow credit purchases
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      // Added credit_purchase
      enum: ["payment", "deposit", "withdrawal", "credit_purchase"],
      default: "payment",
    },
    status: {
      type: String,
      // Added completed
      enum: ["success", "failed", "completed"],
      default: "success",
    },
    metadata: {
      type: Object // Flexible metadata storage
    }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);