import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true
    },
    
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    
    // 🧠 ENHANCED STATE MACHINE
    status: {
      type: String,
      enum: ["pending", "negotiating", "active", "completed", "blocked", "rejected"],
      default: "pending",
      index: true
    },
    
    // SMART METADATA
    metadata: {
      hiredWorker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
      hiredAt: Date,
      completedAt: Date,
      autoArchiveAt: Date,
      messageLimit: { type: Number, default: 3 },
      messagesSent: { type: Number, default: 0 }
    },
    
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      intent: { type: String, enum: ["question", "offer", "clarification", "agreement", "casual"] },
      createdAt: Date
    },
    
    // Smart unread tracking
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    },
    
    // Unique identifier for each job+applicant pair
    uniqueKey: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Generate unique key before save
conversationSchema.pre('save', function(next) {
  if (this.participants && this.listing && this.participants.length === 2) {
    const sortedParticipants = [...this.participants].sort().join('-');
    this.uniqueKey = `${this.listing}-${sortedParticipants}`;
  }
  next();
});

// Prevent duplicate conversations
conversationSchema.index({ listing: 1, participants: 1 }, { unique: true });

// Virtual for other participant
conversationSchema.virtual('otherParticipant', {
  ref: 'User',
  localField: 'participants',
  foreignField: '_id',
  justOne: false
});

// Methods for state management
conversationSchema.methods.canSendMessage = function(userId) {
  const userRole = this.participants[0].toString() === userId.toString() ? 'applicant' : 'client';
  
  const rules = {
    pending: { applicant: true, client: false, limit: 3 },
    negotiating: { applicant: true, client: true, limit: null },
    active: { applicant: true, client: true, limit: null },
    completed: { applicant: false, client: false, limit: null },
    blocked: { applicant: false, client: false, limit: null },
    rejected: { applicant: false, client: false, limit: null }
  };
  
  return rules[this.status]?.[userRole] || false;
};

conversationSchema.methods.updateStatus = async function(newStatus, metadata = {}) {
  this.status = newStatus;
  
  if (newStatus === 'active') {
    this.metadata.hiredAt = new Date();
    this.metadata.hiredWorker = metadata.hiredWorker;
    this.metadata.offerId = metadata.offerId;
  }
  
  if (newStatus === 'completed') {
    this.metadata.completedAt = new Date();
    this.metadata.autoArchiveAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  return this.save();
};

export default mongoose.model("Conversation", conversationSchema);