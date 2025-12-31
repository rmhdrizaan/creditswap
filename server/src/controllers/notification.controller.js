import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "username avatar");
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};