import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    }],
    
    // Context linking
    relatedListing: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Listing" 
    },
    relatedOffer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Offer" 
    },
    
    // Chat stage based on offer status
    stage: {
      type: String,
      enum: ["negotiation", "work", "completed", "archived"],
      default: "negotiation"
    },
    
    // Metadata
    title: { 
      type: String,
      trim: true 
    },
    isMuted: { 
      type: Boolean, 
      default: false 
    },
    isPinned: { 
      type: Boolean, 
      default: false 
    },
    lastActivity: { 
      type: Date, 
      default: Date.now 
    },
    unreadCount: { 
      type: Map,
      of: Number,
      default: {} 
    },
    
    // Messages
    latestMessage: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Message" 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for job title
conversationSchema.virtual('jobTitle').get(async function() {
  if (this.relatedListing && !this.title) {
    try {
      const Listing = mongoose.model('Listing');
      const listing = await Listing.findById(this.relatedListing).select('title');
      return listing?.title || 'Untitled Job';
    } catch (error) {
      return 'Untitled Job';
    }
  }
  return this.title || 'Direct Message';
});

// Indexes for performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ relatedListing: 1 });
conversationSchema.index({ relatedOffer: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ "unreadCount": 1 });
conversationSchema.index({ participants: 1, lastActivity: -1 });

// Static method to find or create conversation with context
conversationSchema.statics.findOrCreateWithContext = async function(data) {
  const { participants, relatedListing, relatedOffer, userId } = data;
  
  // Check if conversation already exists
  let conversation = await this.findOne({
    participants: { $all: participants, $size: participants.length },
    relatedListing: relatedListing || null,
    relatedOffer: relatedOffer || null
  })
  .populate("participants", "username avatar email")
  .populate("relatedListing", "title status")
  .populate("relatedOffer", "status offerAmount")
  .populate("latestMessage");

  if (!conversation) {
    // Create new conversation
    conversation = await this.create({
      participants,
      relatedListing: relatedListing || null,
      relatedOffer: relatedOffer || null,
      title: data.title || null,
      unreadCount: participants.reduce((acc, participant) => {
        acc.set(participant.toString(), participant.toString() === userId ? 0 : 1);
        return acc;
      }, new Map())
    });

    // Populate after creation
    conversation = await this.findById(conversation._id)
      .populate("participants", "username avatar email")
      .populate("relatedListing", "title status")
      .populate("relatedOffer", "status offerAmount");
  }

  return conversation;
};

// Method to update unread count
conversationSchema.methods.markAsRead = function(userId) {
  if (this.unreadCount.has(userId.toString())) {
    this.unreadCount.set(userId.toString(), 0);
    this.markModified('unreadCount');
  }
  return this.save();
};

// Method to increment unread count
conversationSchema.methods.incrementUnread = function(userId) {
  if (this.unreadCount.has(userId.toString())) {
    const current = this.unreadCount.get(userId.toString()) || 0;
    this.unreadCount.set(userId.toString(), current + 1);
    this.markModified('unreadCount');
  }
  this.lastActivity = new Date();
  return this.save();
};

// Pre-save middleware
conversationSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default mongoose.model("Conversation", conversationSchema);