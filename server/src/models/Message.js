import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    
    conversation: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Conversation",
      required: true,
      index: true 
    },
    
    // Message type for structured content
    type: {
      type: String,
      enum: [
        "text",           // Plain text message
        "system",         // System message (offer accepted, job completed, etc.)
        "file",          // File attachment
        "image",         // Image
        "offer_update",  // Offer was updated
        "job_status",    // Job status changed
        "payment",       // Payment related
        "review"         // Review/rating
      ],
      default: "text"
    },
    
    // Content based on type
    content: { 
      type: String,
      trim: true,
      required: function() {
        return this.type === "text" || this.type === "system";
      }
    },
    
    // File metadata (for file/image types)
    file: {
      url: String,
      name: String,
      size: Number,
      mimeType: String,
      thumbnail: String
    },
    
    // System message metadata
    systemData: {
      action: String,     // "offer_accepted", "job_completed", etc.
      metadata: mongoose.Schema.Types.Mixed
    },
    
    // Read status
    readBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    
    // Reactions
    reactions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: String,
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Reply to another message
    replyTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Message" 
    },
    
    // Edit history
    edited: { 
      type: Boolean, 
      default: false 
    },
    editHistory: [{
      content: String,
      editedAt: { type: Date, default: Date.now }
    }],
    
    // Delete status (soft delete)
    deleted: { 
      type: Boolean, 
      default: false 
    },
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ "readBy": 1 });
messageSchema.index({ type: 1 });

// Virtual for formatted time
messageSchema.virtual('time').get(function() {
  const now = new Date();
  const messageDate = new Date(this.createdAt);
  
  const diffMs = now - messageDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return messageDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
});

// Virtual for detailed timestamp
messageSchema.virtual('detailedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
});

// Static method to create system message
messageSchema.statics.createSystemMessage = async function(data) {
  const { conversation, action, metadata, sender } = data;
  
  const systemMessages = {
    offer_sent: "Offer sent",
    offer_accepted: "Offer accepted",
    offer_rejected: "Offer rejected",
    offer_updated: "Offer updated",
    job_started: "Work started",
    job_completed: "Job completed",
    job_cancelled: "Job cancelled",
    payment_sent: "Payment sent",
    payment_received: "Payment received",
    review_given: "Review submitted"
  };
  
  const message = await this.create({
    sender: sender || null,
    conversation,
    type: "system",
    content: systemMessages[action] || "System notification",
    systemData: {
      action,
      metadata: metadata || {}
    }
  });
  
  return message.populate("sender", "username avatar");
};

// Method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
  }
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => 
    r.userId.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (existingReaction) {
    // Remove reaction
    this.reactions = this.reactions.filter(r => 
      !(r.userId.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    // Add reaction
    this.reactions.push({ userId, emoji });
  }
  
  return this.save();
};

// Method to edit message (only for sender)
messageSchema.methods.edit = function(newContent, userId) {
  if (this.sender.toString() !== userId.toString()) {
    throw new Error("Only sender can edit message");
  }
  
  if (this.type !== "text") {
    throw new Error("Only text messages can be edited");
  }
  
  // Save to edit history
  if (!this.editHistory) {
    this.editHistory = [];
  }
  
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  // Update content
  this.content = newContent;
  this.edited = true;
  
  return this.save();
};

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // If message is deleted, clear content
  if (this.deleted && !this.content.includes("[Deleted]")) {
    this.content = "[Message deleted]";
  }
  next();
});

export default mongoose.model("Message", messageSchema);