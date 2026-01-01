import Notification from "../models/Notification.js";
import mongoose from "mongoose";

export const getMyNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("sender", "username avatar")
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    // Mark as seen (not read) for UI
    const notificationIds = notifications.map(n => n._id);
    await Notification.updateMany(
      { _id: { $in: notificationIds }, read: false },
      { $set: { seen: true } }
    );

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Notification.countDocuments({ recipient: req.user._id }),
        unreadCount
      }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications" 
    });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid notification ID" 
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update notification" 
    });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { 
        read: true,
        readAt: new Date(),
        seen: true
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark all notifications as read" 
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid notification ID" 
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete notification" 
    });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    const unseenCount = await Notification.countDocuments({
      recipient: req.user._id,
      seen: false
    });

    const totalCount = await Notification.countDocuments({
      recipient: req.user._id
    });

    // Get notifications by type
    const byType = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
        unseenCount,
        totalCount,
        byType: byType.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notification statistics" 
    });
  }
};