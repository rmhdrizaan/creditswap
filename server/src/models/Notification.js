import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: [
        'offer_received',
        'offer_accepted',
        'offer_rejected',
        'job_completed',
        'credit_purchase',
        'payment_received',
        'system_alert',
        'account_update',
        'message_received',
        'rating_received',
        'job_reminder',
        'promotion'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    seen: {
      type: Boolean,
      default: false,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    actionUrl: {
      type: String,
      trim: true
    },
    expiresAt: {
      type: Date,
      index: { expires: '90d' } // Auto-delete after 90 days
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  
  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 90 days from creation
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method for creating notifications
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    
    // In a real app, emit WebSocket event here
    // io.to(`user:${data.recipient}`).emit('new_notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method for bulk create
notificationSchema.statics.createBulkNotifications = async function(notifications) {
  try {
    const created = await this.insertMany(notifications);
    return created;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;