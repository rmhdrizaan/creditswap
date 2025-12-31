import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Listing from "../models/Listing.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// 🔧 STATE MACHINE RULES
const CHAT_RULES = {
  pending: {
    canSend: { applicant: true, client: false },
    rateLimit: 60000, // 1 minute
    messageLimit: 3,
    allowedIntents: ["question", "clarification", "casual"],
    systemMessages: ["conversation_started", "job_hired_to_other"]
  },
  negotiating: {
    canSend: { applicant: true, client: true },
    rateLimit: 30000, // 30 seconds
    messageLimit: null,
    allowedIntents: ["question", "offer", "clarification", "agreement"],
    systemMessages: ["offer_made", "offer_accepted"]
  },
  active: {
    canSend: { applicant: true, client: true },
    rateLimit: null,
    messageLimit: null,
    allowedIntents: ["question", "clarification", "agreement", "action_required"],
    systemMessages: ["job_started", "milestone_completed"]
  },
  completed: {
    canSend: { applicant: false, client: false },
    rateLimit: null,
    messageLimit: null,
    allowedIntents: [],
    systemMessages: ["job_completed", "payment_released"]
  },
  blocked: {
    canSend: { applicant: false, client: false },
    rateLimit: null,
    messageLimit: null,
    allowedIntents: [],
    systemMessages: ["conversation_blocked"]
  },
  rejected: {
    canSend: { applicant: false, client: false },
    rateLimit: null,
    messageLimit: null,
    allowedIntents: [],
    systemMessages: ["application_rejected"]
  }
};

// 1. Start or Get Conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const { listingId, workerId } = req.body;
    const clientId = req.user.userId;

    // Validate users exist
    const [client, worker, listing] = await Promise.all([
      User.findById(clientId),
      User.findById(workerId),
      Listing.findById(listingId).populate('user', 'username')
    ]);

    if (!client || !worker || !listing) {
      return res.status(404).json({ message: "User or listing not found" });
    }

    // Check if listing belongs to client
    if (listing.user._id.toString() !== clientId.toString()) {
      return res.status(403).json({ message: "Only listing owner can start conversation" });
    }

    // Check for existing conversation
    let conversation = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [clientId, workerId] }
    })
      .populate("participants", "username avatar email")
      .populate("listing", "title status credits")
      .populate("metadata.hiredWorker", "username");

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
        alreadyExists: true
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      listing: listingId,
      participants: [clientId, workerId],
      status: "pending",
      unreadCounts: new Map([[clientId, 0], [workerId, 0]]),
      metadata: {
        messageLimit: 3,
        messagesSent: 0
      }
    });

    // Populate and return
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "username avatar email")
      .populate("listing", "title status credits");

    // Create welcome system message
    await Message.create({
      conversationId: conversation._id,
      sender: clientId,
      content: "Conversation started. You can discuss job details before hiring.",
      type: "system",
      systemData: {
        action: "conversation_started",
        actor: clientId
      }
    });

    res.status(201).json({
      success: true,
      conversation,
      alreadyExists: false,
      message: "Conversation started successfully"
    });

  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Send Message with State Validation
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, intent = "casual" } = req.body;
    const senderId = req.user.userId;

    // Get conversation with all details
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "_id username")
      .populate("listing", "title status user");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === senderId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get user role (client or applicant)
    const isClient = conversation.listing.user.toString() === senderId.toString();
    const userRole = isClient ? "client" : "applicant";

    // Get state rules
    const stateRules = CHAT_RULES[conversation.status];
    if (!stateRules) {
      return res.status(400).json({ message: "Invalid conversation state" });
    }

    // Check if user can send in current state
    if (!stateRules.canSend[userRole]) {
      return res.status(403).json({ 
        message: `Cannot send messages in ${conversation.status} state` 
      });
    }

    // Check intent is allowed
    if (!stateRules.allowedIntents.includes(intent)) {
      return res.status(403).json({ 
        message: `Intent "${intent}" not allowed in current state` 
      });
    }

    // Rate limiting for pending state
    if (stateRules.rateLimit && conversation.status === "pending") {
      const lastMessage = await Message.findOne({
        conversationId,
        sender: senderId
      }).sort({ createdAt: -1 });
      
      if (lastMessage) {
        const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
        if (timeDiff < stateRules.rateLimit) {
          return res.status(429).json({ 
            message: "Please wait before sending another message" 
          });
        }
      }
    }

    // Message limit for pending state
    if (stateRules.messageLimit && conversation.status === "pending") {
      const messageCount = await Message.countDocuments({
        conversationId,
        sender: senderId,
        type: "text"
      });
      
      if (messageCount >= stateRules.messageLimit) {
        // Auto-reject if limit reached
        conversation.status = "rejected";
        await conversation.save();
        
        await Message.create({
          conversationId,
          sender: senderId,
          content: "Message limit reached. This application has been automatically closed.",
          type: "system",
          systemData: {
            action: "message_limit_reached",
            actor: senderId
          }
        });
        
        return res.status(403).json({ 
          message: "Message limit reached. Application closed." 
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: senderId,
      content: content.trim(),
      intent,
      type: "text",
      readBy: [{ user: senderId, readAt: new Date() }]
    });

    // Update conversation
    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== senderId.toString()
    );

    // Increment unread count for other participant
    const currentUnread = conversation.unreadCounts.get(otherParticipant._id.toString()) || 0;
    conversation.unreadCounts.set(otherParticipant._id.toString(), currentUnread + 1);
    
    conversation.lastMessage = {
      content: content.length > 100 ? content.substring(0, 100) + "..." : content,
      sender: senderId,
      intent,
      createdAt: new Date()
    };
    
    if (conversation.status === "pending") {
      conversation.metadata.messagesSent = (conversation.metadata.messagesSent || 0) + 1;
    }
    
    await conversation.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username avatar")
      .populate("readBy.user", "username");

    // Send notification to other participant
    await Notification.create({
      recipient: otherParticipant._id,
      sender: senderId,
      type: "message_received",
      relatedId: conversationId,
      message: `New message from ${populatedMessage.sender.username}: ${content.substring(0, 50)}...`
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationStatus: conversation.status,
      messagesRemaining: stateRules.messageLimit 
        ? Math.max(0, stateRules.messageLimit - (conversation.metadata.messagesSent || 0))
        : null
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Messages for Conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;

    // Verify access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversationId })
      .populate("sender", "username avatar")
      .populate("readBy.user", "username")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ conversationId });

    // Mark messages as read for this user
    await Message.updateMany(
      {
        conversationId,
        "readBy.user": { $ne: userId }
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } }
      }
    );

    // Reset unread count for this user
    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      conversationStatus: conversation.status
    });

  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Get User Conversations (Inbox)
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "username avatar email")
      .populate("listing", "title status credits user")
      .populate("metadata.hiredWorker", "username")
      .sort({ updatedAt: -1 });

    // Enrich with unread counts and other participant info
    const enrichedConversations = conversations.map(conv => {
      const convObj = conv.toObject();
      
      // Get other participant
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      
      // Get unread count for this user
      const unreadCount = conv.unreadCounts.get(userId.toString()) || 0;
      
      // Determine if user is client or applicant
      const isClient = conv.listing.user.toString() === userId.toString();
      
      return {
        ...convObj,
        otherParticipant,
        unreadCount,
        userRole: isClient ? "client" : "applicant",
        canSend: conv.canSendMessage(userId)
      };
    });

    res.status(200).json({
      success: true,
      conversations: enrichedConversations,
      total: enrichedConversations.length
    });

  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5. Mark Conversation as Read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Reset unread count
    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    // Mark all messages as read
    await Message.updateMany(
      {
        conversationId,
        "readBy.user": { $ne: userId }
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } }
      }
    );

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ message: error.message });
  }
};

// 6. Update Conversation Status (Hire/Complete/Reject)
export const updateConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, systemMessage, metadata = {} } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "_id username")
      .populate("listing", "title");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is the client
    const isClient = conversation.listing.user.toString() === userId.toString();
    if (!isClient) {
      return res.status(403).json({ message: "Only client can update conversation status" });
    }

    // Validate state transition
    const validTransitions = {
      pending: ["active", "rejected"],
      negotiating: ["active", "rejected"],
      active: ["completed"],
      completed: [] // Can't change from completed
    };

    if (!validTransitions[conversation.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${conversation.status} to ${status}` 
      });
    }

    // If hiring, get the other participant as hired worker
    if (status === "active") {
      const hiredWorker = conversation.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      metadata.hiredWorker = hiredWorker._id;
    }

    // Update conversation
    await conversation.updateStatus(status, metadata);

    // Create system message
    if (systemMessage) {
      await Message.create({
        conversationId,
        sender: userId,
        content: systemMessage,
        type: "system",
        systemData: {
          action: status,
          actor: userId,
          metadata
        }
      });
    }

    // If hiring, reject all other conversations for this listing
    if (status === "active") {
      const hiredWorkerId = metadata.hiredWorker;
      
      // Find all other conversations for this listing
      const otherConversations = await Conversation.find({
        listing: conversation.listing._id,
        _id: { $ne: conversationId },
        status: { $in: ["pending", "negotiating"] }
      });

      // Reject all other conversations
      for (const otherConv of otherConversations) {
        otherConv.status = "rejected";
        await otherConv.save();

        // Send rejection notification
        await Message.create({
          conversationId: otherConv._id,
          sender: userId,
          content: "This job has been assigned to another applicant.",
          type: "system",
          systemData: {
            action: "job_hired_to_other",
            actor: userId
          }
        });

        // Create notification
        const otherApplicant = otherConv.participants.find(
          p => p.toString() !== userId.toString()
        );
        
        await Notification.create({
          recipient: otherApplicant,
          sender: userId,
          type: "offer_rejected",
          relatedId: conversation.listing._id,
          message: `The job "${conversation.listing.title}" has been assigned to another applicant.`
        });
      }
    }

    // Get updated conversation
    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "username avatar email")
      .populate("listing", "title status credits")
      .populate("metadata.hiredWorker", "username");

    res.status(200).json({
      success: true,
      conversation: updatedConversation,
      message: `Conversation status updated to ${status}`
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: error.message });
  }
};

// 7. Get Conversation Details
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username avatar email")
      .populate("listing", "title status credits user")
      .populate("metadata.hiredWorker", "username");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Determine user role
    const isClient = conversation.listing.user.toString() === userId.toString();
    const userRole = isClient ? "client" : "applicant";

    // Get state rules
    const stateRules = CHAT_RULES[conversation.status];
    
    // Calculate remaining messages for pending state
    let messagesRemaining = null;
    if (conversation.status === "pending") {
      const messageCount = await Message.countDocuments({
        conversationId,
        sender: userId,
        type: "text"
      });
      messagesRemaining = Math.max(0, 3 - messageCount);
    }

    res.status(200).json({
      success: true,
      conversation,
      userRole,
      permissions: {
        canSend: conversation.canSendMessage(userId),
        allowedIntents: stateRules?.allowedIntents || [],
        rateLimit: stateRules?.rateLimit || null,
        messagesRemaining
      }
    });

  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: error.message });
  }
};