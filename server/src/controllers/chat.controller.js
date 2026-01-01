import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Offer from "../models/Offer.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

/* =============================
   ACCESS OR CREATE CHAT (WITH CONTEXT)
============================= */
export const accessChat = async (req, res) => {
  try {
    const { userId, listingId, offerId, title } = req.body;
    
    // Validate participants
    const otherUserId = userId || req.body.otherUserId;
    if (!otherUserId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID is required to start a chat" 
      });
    }

    // Check if users exist
    const [currentUser, otherUser] = await Promise.all([
      User.findById(req.user._id),
      User.findById(otherUserId)
    ]);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Validate context if provided
    if (listingId) {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ 
          success: false,
          message: "Listing not found" 
        });
      }
      
      // Check if current user is owner or has made an offer
      const isOwner = listing.owner.toString() === req.user._id.toString();
      const hasOffer = await Offer.findOne({
        listing: listingId,
        worker: req.user._id,
        status: { $in: ["pending", "accepted"] }
      });
      
      if (!isOwner && !hasOffer) {
        return res.status(403).json({ 
          success: false,
          message: "You need to make an offer to chat about this listing" 
        });
      }
    }

    if (offerId) {
      const offer = await Offer.findById(offerId);
      if (!offer) {
        return res.status(404).json({ 
          success: false,
          message: "Offer not found" 
        });
      }
      
      // Check if current user is involved in the offer
      const isInvolved = offer.worker.toString() === req.user._id.toString() || 
                         offer.listingOwner.toString() === req.user._id.toString();
      
      if (!isInvolved) {
        return res.status(403).json({ 
          success: false,
          message: "You are not part of this offer" 
        });
      }
    }

    // Create participants array (sorted for consistency)
    const participants = [req.user._id, otherUserId].sort();
    
    // Find or create conversation
    const conversation = await Conversation.findOrCreateWithContext({
      participants,
      relatedListing: listingId,
      relatedOffer: offerId,
      title,
      userId: req.user._id
    });

    // Update unread count for current user (mark as read)
    await conversation.markAsRead(req.user._id);

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("Access chat error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =============================
   GET ALL CHATS FOR USER (WITH CONTEXT)
============================= */
export const fetchChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get conversations with pagination
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { participants: userId };
    
    // Search by participant name or job title
    if (search) {
      const users = await User.find({
        username: { $regex: search, $options: "i" }
      }).select("_id");
      
      const userIds = users.map(u => u._id);
      
      // Also search in listing titles through population
      query.$or = [
        { participants: { $in: userIds } },
        { title: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count
    const total = await Conversation.countDocuments(query);

    // Get conversations with population
    const conversations = await Conversation.find(query)
      .populate({
        path: "participants",
        select: "username avatar email"
      })
      .populate({
        path: "relatedListing",
        select: "title status thumbnail"
      })
      .populate({
        path: "relatedOffer",
        select: "status offerAmount"
      })
      .populate({
        path: "latestMessage",
        select: "content type sender createdAt readBy"
      })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get unread counts for each conversation
    const conversationsWithUnread = conversations.map(conv => {
      const unread = conv.unreadCount?.get(userId.toString()) || 0;
      return {
        ...conv,
        unreadCount: unread,
        // Get other participant info
        otherParticipant: conv.participants.find(p => 
          p._id.toString() !== userId.toString()
        ),
        // Get job title
        jobTitle: conv.relatedListing?.title || conv.title || "Direct Message"
      };
    });

    // Get total unread count across all chats
    const totalUnread = conversationsWithUnread.reduce((sum, conv) => sum + conv.unreadCount, 0);

    res.status(200).json({
      success: true,
      conversations: conversationsWithUnread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalUnread,
        totalConversations: total
      }
    });
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch conversations" 
    });
  }
};

/* =============================
   SEND MESSAGE (WITH VALIDATION)
============================= */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = "text", file, replyTo } = req.body;
    
    // Validate required fields
    if (!conversationId) {
      return res.status(400).json({ 
        success: false,
        message: "Conversation ID is required" 
      });
    }

    if (type === "text" && (!content || content.trim() === "")) {
      return res.status(400).json({ 
        success: false,
        message: "Message content cannot be empty" 
      });
    }

    if ((type === "file" || type === "image") && !file?.url) {
      return res.status(400).json({ 
        success: false,
        message: "File URL is required for file/image messages" 
      });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    const isParticipant = conversation.participants.some(p => 
      p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: "You are not a participant in this conversation" 
      });
    }

    // Check replyTo message if provided
    if (replyTo) {
      const repliedMessage = await Message.findById(replyTo);
      if (!repliedMessage || repliedMessage.conversation.toString() !== conversationId) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid message to reply to" 
        });
      }
    }

    // Validate context restrictions
    if (conversation.relatedOffer) {
      const offer = await Offer.findById(conversation.relatedOffer);
      if (offer) {
        // Restrict chat based on offer stage
        if (offer.status === "rejected" || offer.status === "cancelled") {
          return res.status(403).json({ 
            success: false,
            message: "Cannot send messages for rejected/cancelled offers" 
          });
        }
        
        // Update conversation stage based on offer status
        if (offer.status === "accepted" && conversation.stage !== "work") {
          conversation.stage = "work";
          await conversation.save();
        }
      }
    }

    // Create message
    const messageData = {
      sender: req.user._id,
      conversation: conversationId,
      type,
      content: type === "text" ? content.trim() : "",
      file: type === "file" || type === "image" ? file : undefined,
      replyTo
    };

    const message = await Message.create(messageData);

    // Populate message data
    await message.populate([
      { path: "sender", select: "username avatar" },
      { path: "replyTo", select: "content sender", populate: { path: "sender", select: "username" } }
    ]);

    // Update conversation
    conversation.latestMessage = message._id;
    conversation.lastActivity = new Date();
    
    // Increment unread count for other participants
    const otherParticipants = conversation.participants.filter(p => 
      p.toString() !== req.user._id.toString()
    );
    
    for (const participant of otherParticipants) {
      await conversation.incrementUnread(participant);
      
      // Create notification for other participants
      await Notification.createNotification({
        recipient: participant,
        sender: req.user._id,
        type: "message_received",
        title: "New Message",
        message: `New message from ${req.user.username}`,
        data: {
          conversationId: conversation._id,
          messageId: message._id,
          preview: content?.substring(0, 50) || "New message"
        },
        actionUrl: `/chat/${conversation._id}`
      });
    }
    
    await conversation.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =============================
   GET MESSAGES FOR CONVERSATION (WITH PAGINATION)
============================= */
export const allMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const skip = (page - 1) * limit;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    const isParticipant = conversation.participants.some(p => 
      p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: "You are not a participant in this conversation" 
      });
    }

    // Build query
    let query = { conversation: conversationId, deleted: false };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages with pagination
    const messages = await Message.find(query)
      .populate("sender", "username avatar")
      .populate({
        path: "replyTo",
        select: "content sender",
        populate: { path: "sender", select: "username" }
      })
      .populate("reactions.userId", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Reverse for chronological order
    const chronologicalMessages = messages.reverse();

    // Mark messages as read for current user
    const unreadMessages = chronologicalMessages.filter(msg => 
      !msg.readBy?.some(id => id.toString() === req.user._id.toString())
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { 
          _id: { $in: unreadMessages.map(m => m._id) },
          sender: { $ne: req.user._id }
        },
        { $addToSet: { readBy: req.user._id } }
      );
    }

    // Update conversation unread count
    await conversation.markAsRead(req.user._id);

    // Get total message count
    const total = await Message.countDocuments({ conversation: conversationId, deleted: false });

    res.status(200).json({
      success: true,
      messages: chronologicalMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total
      },
      conversation: {
        id: conversation._id,
        title: conversation.title,
        participants: conversation.participants,
        relatedListing: conversation.relatedListing,
        relatedOffer: conversation.relatedOffer,
        stage: conversation.stage
      }
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch messages" 
    });
  }
};

/* =============================
   MARK MESSAGES AS READ
============================= */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Update conversation unread count
    await conversation.markAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark messages as read" 
    });
  }
};

/* =============================
   DELETE MESSAGE (SOFT DELETE)
============================= */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: "Message not found" 
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "You can only delete your own messages" 
      });
    }

    // Soft delete
    message.deleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user._id;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted"
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete message" 
    });
  }
};

/* =============================
   ADD REACTION TO MESSAGE
============================= */
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ 
        success: false,
        message: "Emoji is required" 
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: "Message not found" 
      });
    }

    await message.addReaction(req.user._id, emoji);
    
    const updatedMessage = await Message.findById(messageId)
      .populate("reactions.userId", "username");

    res.status(200).json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add reaction" 
    });
  }
};

/* =============================
   EDIT MESSAGE
============================= */
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ 
        success: false,
        message: "Message content cannot be empty" 
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: "Message not found" 
      });
    }

    await message.edit(content.trim(), req.user._id);
    
    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "username avatar");

    res.status(200).json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =============================
   GET CONVERSATION DETAILS
============================= */
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username avatar email")
      .populate("relatedListing", "title status credits thumbnail")
      .populate("relatedOffer", "status offerAmount notes")
      .populate("latestMessage");

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    const isParticipant = conversation.participants.some(p => 
      p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: "You are not a participant in this conversation" 
      });
    }

    // Get other participant
    const otherParticipant = conversation.participants.find(p => 
      p._id.toString() !== req.user._id.toString()
    );

    // Get job details if related
    let jobDetails = null;
    if (conversation.relatedListing) {
      jobDetails = {
        id: conversation.relatedListing._id,
        title: conversation.relatedListing.title,
        status: conversation.relatedListing.status,
        credits: conversation.relatedListing.credits,
        thumbnail: conversation.relatedListing.thumbnail
      };
    }

    // Get offer details if related
    let offerDetails = null;
    if (conversation.relatedOffer) {
      offerDetails = {
        id: conversation.relatedOffer._id,
        status: conversation.relatedOffer.status,
        offerAmount: conversation.relatedOffer.offerAmount,
        notes: conversation.relatedOffer.notes
      };
    }

    res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        stage: conversation.stage,
        isMuted: conversation.isMuted,
        isPinned: conversation.isPinned,
        createdAt: conversation.createdAt,
        lastActivity: conversation.lastActivity,
        unreadCount: conversation.unreadCount?.get(req.user._id.toString()) || 0,
        otherParticipant,
        jobDetails,
        offerDetails
      }
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch conversation details" 
    });
  }
};

/* =============================
   UPDATE CONVERSATION SETTINGS
============================= */
export const updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isMuted, isPinned, title } = req.body;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    const isParticipant = conversation.participants.some(p => 
      p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: "You are not a participant in this conversation" 
      });
    }

    // Update fields
    if (typeof isMuted === 'boolean') {
      conversation.isMuted = isMuted;
    }
    
    if (typeof isPinned === 'boolean') {
      conversation.isPinned = isPinned;
    }
    
    if (title && title.trim() !== "") {
      conversation.title = title.trim();
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update conversation" 
    });
  }
};

/* =============================
   GET CHAT STATISTICS
============================= */
export const getChatStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Conversation.aggregate([
      { $match: { participants: userId } },
      {
        $project: {
          unreadCount: { $ifNull: [`$unreadCount.${userId}`, 0] },
          stage: 1,
          isPinned: 1,
          isMuted: 1,
          lastActivity: 1
        }
      },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          totalUnread: { $sum: "$unreadCount" },
          pinnedConversations: { $sum: { $cond: ["$isPinned", 1, 0] } },
          mutedConversations: { $sum: { $cond: ["$isMuted", 1, 0] } },
          recentActivity: { $max: "$lastActivity" }
        }
      }
    ]);

    // Get message count
    const messageCount = await Message.countDocuments({
      sender: userId,
      deleted: false
    });

    res.status(200).json({
      success: true,
      stats: {
        ...(stats[0] || {
          totalConversations: 0,
          totalUnread: 0,
          pinnedConversations: 0,
          mutedConversations: 0,
          recentActivity: null
        }),
        totalMessages: messageCount
      }
    });
  } catch (error) {
    console.error("Get chat stats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch chat statistics" 
    });
  }
};