import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },
    
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    
    // 🆕 INTENT-BASED MESSAGING
    intent: {
      type: String,
      enum: ["question", "offer", "clarification", "agreement", "casual", "action_required"],
      default: "casual"
    },
    
    type: {
      type: String,
      enum: ["text", "system", "offer", "milestone", "delivery", "payment"],
      default: "text"
    },
    
    // System message metadata
    systemData: {
      action: String,
      actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      metadata: mongoose.Schema.Types.Mixed
    },
    
    // Read tracking
    readBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now }
    }],
    
    // Delivery status
    deliveredTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    
    // 🆕 Smart metadata for AI features
    aiMetadata: {
      sentiment: { type: Number, min: -1, max: 1 },
      requiresResponse: Boolean,
      suggestedActions: [String]
    },
    
    // Reactions
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Virtual for sender details
messageSchema.virtual('senderDetails', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model("Message", messageSchema);