import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Transaction from "../models/Transaction.js";

// Credit packages configuration
const CREDIT_PACKAGES = [
  { id: 1, credits: 10, price: 1.00, discount: 0, tag: "Starter" },
  { id: 2, credits: 50, price: 4.50, discount: 10, tag: "Popular" },
  { id: 3, credits: 100, price: 8.00, discount: 20, tag: "Power" },
  { id: 4, credits: 250, price: 18.00, discount: 28, tag: "Enterprise" },
  { id: 5, credits: 500, price: 35.00, discount: 30, tag: "Mega" },
  { id: 6, credits: 1000, price: 65.00, discount: 35, tag: "Ultimate" }
];

export const purchaseCredits = async (req, res) => {
  try {
    const { packageId, paymentMethod = "card" } = req.body;

    // Find the selected package
    const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credit package selected" 
      });
    }

    // Validate payment method
    const validPaymentMethods = ['card', 'paypal', 'crypto', 'bank'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid payment method" 
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentIntentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create payment record
    const payment = await Payment.create({
      userId: req.user._id,
      credits: selectedPackage.credits,
      amount: selectedPackage.price,
      currency: 'USD',
      paymentMethod,
      paymentIntentId,
      status: "completed",
      metadata: {
        packageId: selectedPackage.id,
        packageName: selectedPackage.tag,
        discount: selectedPackage.discount,
        transactionId
      }
    });

    // Update user's credit balance
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: selectedPackage.credits } },
      { new: true, select: 'credits username email' }
    );

    // Create transaction record
    await Transaction.create({
      sender: null, // System
      receiver: req.user._id,
      amount: selectedPackage.credits,
      type: 'credit_purchase',
      status: 'completed',
      listing: null,
      metadata: {
        paymentId: payment._id,
        packageId: selectedPackage.id,
        originalPrice: selectedPackage.price / (1 - selectedPackage.discount / 100)
      }
    });

    // Create notification for user
    await Notification.create({
      recipient: req.user._id,
      type: 'credit_purchase',
      title: 'Credits Purchased Successfully!',
      message: `You have successfully purchased ${selectedPackage.credits} credits.`,
      data: {
        credits: selectedPackage.credits,
        amount: selectedPackage.price,
        newBalance: updatedUser.credits
      },
      read: false
    });

    res.status(201).json({
      success: true,
      message: `Successfully purchased ${selectedPackage.credits} credits!`,
      data: {
        credits: selectedPackage.credits,
        amount: selectedPackage.price,
        newBalance: updatedUser.credits,
        transactionId: payment._id,
        paymentMethod,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Purchase credits error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to process payment. Please try again." 
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const history = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('credits amount paymentMethod status createdAt metadata')
      .lean();

    // Format response
    const formattedHistory = history.map(payment => ({
      id: payment._id,
      credits: payment.credits,
      amount: payment.amount,
      method: payment.paymentMethod,
      status: payment.status,
      date: payment.createdAt,
      package: payment.metadata?.packageName || 'Custom'
    }));

    res.status(200).json({
      success: true,
      data: formattedHistory,
      count: formattedHistory.length
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch payment history" 
    });
  }
};

export const getCreditPackages = async (req, res) => {
  try {
    const packages = CREDIT_PACKAGES.map(pkg => ({
      id: pkg.id,
      credits: pkg.credits,
      price: pkg.price,
      originalPrice: pkg.price / (1 - pkg.discount / 100),
      discount: pkg.discount,
      tag: pkg.tag,
      perCreditPrice: (pkg.price / pkg.credits).toFixed(2),
      features: getPackageFeatures(pkg.id)
    }));

    res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error("Get credit packages error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch credit packages" 
    });
  }
};

// Helper function for package features
function getPackageFeatures(packageId) {
  const features = {
    1: ["Perfect for testing", "1-2 small jobs", "Basic support"],
    2: ["Most popular choice", "5-10 medium jobs", "Priority support", "Faster matching"],
    3: ["Best value for money", "10-20 jobs", "VIP support", "Analytics dashboard"],
    4: ["For power users", "25-50 jobs", "24/7 support", "Team collaboration"],
    5: ["Business tier", "50-100 jobs", "Dedicated account manager", "API access"],
    6: ["Enterprise solution", "Unlimited jobs", "Custom solutions", "White-label options"]
  };
  return features[packageId] || ["Standard features"];
}