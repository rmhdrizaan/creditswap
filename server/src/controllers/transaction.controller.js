import Transaction from "../models/Transaction.js";

// @desc    Get my transaction history
// @route   GET /api/transactions
export const getMyTransactions = async (req, res) => {
  try {
    // Find transactions where I am Sender OR Receiver
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .populate("listing", "title")
      .sort({ createdAt: -1 }); // Newest first

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};