import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    credits: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "USD"
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "crypto", "bank"],
      required: true
    },
    paymentIntentId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    metadata: {
      type: Object // Changed from Map/String to Object to support Numbers/IDs
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;