import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Check, Sparkles, TrendingUp, Shield, CreditCard,
  Wallet, Gift, Star, Lock, ArrowRight, ArrowLeft, Coins,
  Target, Users, Gem, Crown, Rocket, ShieldCheck, BadgeCheck,
  Loader2, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { useAuth } from "../../src/context/AuthContext";
import { purchaseCredits, getCreditPackages } from "../../src/services/paymentService";
import { toast, Toaster } from 'react-hot-toast';

export default function CreditPurchase() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);

  // Fetch credit packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await getCreditPackages();
      if (response.success) {
        setPackages(response.data);
        // Auto-select popular package
        const popularPackage = response.data.find(pkg => pkg.tag === "Popular");
        if (popularPackage) {
          setSelectedPackage(popularPackage);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error("Please select a credit package first!");
      return;
    }

    setIsProcessing(true);
    
    // Show processing toast
    const processingToast = toast.loading(
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin h-5 w-5" />
        <span>Processing your payment...</span>
      </div>,
      { duration: Infinity }
    );

    try {
      const result = await purchaseCredits({
        packageId: selectedPackage.id,
        paymentMethod
      });

      if (result.success) {
        // Update user data
        await refreshUser();
        
        // Set purchase details for success modal
        setPurchaseDetails({
          credits: selectedPackage.credits,
          amount: selectedPackage.price,
          newBalance: result.data.newBalance,
          transactionId: result.data.transactionId
        });
        
        // Show success toast
        toast.dismiss(processingToast);
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Successfully purchased {selectedPackage.credits} credits!</span>
          </div>,
          { duration: 4000 }
        );
        
        // Show success modal after delay
        setTimeout(() => {
          setShowSuccess(true);
        }, 800);
      }
    } catch (error) {
      toast.dismiss(processingToast);
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <span>{error.message}</span>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = () => {
    navigate('/wallet');
  };

  const continueShopping = () => {
    setShowSuccess(false);
    setSelectedPackage(null);
    fetchPackages(); // Refresh packages
  };

  const goToWallet = () => {
    navigate('/wallet');
  };

  // Payment methods with icons
  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" },
    { id: "paypal", name: "PayPal", icon: Gift, color: "text-indigo-600", bg: "bg-indigo-100" },
    { id: "crypto", name: "Cryptocurrency", icon: Coins, color: "text-yellow-600", bg: "bg-yellow-100" },
    { id: "bank", name: "Bank Transfer", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" }
  ];

  // Feature cards for earning credits
  const earnFeatures = [
    {
      icon: Target,
      title: "Complete Jobs",
      description: "Apply and finish tasks to earn credits from employers",
      gradient: "from-blue-500 to-cyan-500",
      cta: "Browse Jobs",
      action: () => navigate('/browse')
    },
    {
      icon: Users,
      title: "Refer Friends",
      description: "Get 10% bonus when friends make their first purchase",
      gradient: "from-purple-500 to-pink-500",
      cta: "Invite Friends",
      action: () => toast.success("Referral link copied to clipboard!")
    },
    {
      icon: Rocket,
      title: "Bonus Rewards",
      description: "Complete achievements and level up for bonus credits",
      gradient: "from-orange-500 to-red-500",
      cta: "View Rewards",
      action: () => toast.info("Achievements coming soon!")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/20 pt-24 pb-20 px-4">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '!bg-white !text-slate-800 !border !border-slate-200 !shadow-xl',
          duration: 4000,
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={goBack}
            className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Wallet</span>
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                Buy <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Credits</span>
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                Purchase credits instantly to post jobs, hire talent, and unlock premium features.
                No subscriptions, pay only for what you use.
              </p>
            </div>
            
            {/* Current Balance Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-2xl min-w-[280px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Wallet size={20} className="text-yellow-400" />
                </div>
                <span className="text-slate-300">Current Balance</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={32} className="text-yellow-400 fill-yellow-400" />
                <span className="text-4xl font-bold">{user?.credits?.toLocaleString() || 0}</span>
                <span className="text-slate-400 text-lg">CR</span>
              </div>
              <div className="text-sm text-slate-400">
                1 Credit = $0.10 • Better value with larger packs
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Credit Packages */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Gem className="text-indigo-600" size={24} />
                Choose Your Credit Package
              </h2>
              
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(skeleton => (
                    <div key={skeleton} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
                      <div className="h-10 bg-slate-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const isPopular = pkg.tag === "Popular";
                    
                    return (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? 'ring-3 ring-indigo-500/30 shadow-2xl transform scale-[1.02]' 
                            : 'hover:ring-2 hover:ring-indigo-300 hover:shadow-xl'
                        } bg-white rounded-2xl border-2 ${isSelected ? 'border-indigo-500' : 'border-slate-200'} p-6`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                              <Crown size={12} />
                              MOST POPULAR
                            </span>
                          </div>
                        )}
                        
                        {pkg.discount > 0 && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              SAVE {pkg.discount}%
                            </span>
                          </div>
                        )}
                        
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-xl ${
                              pkg.tag === "Starter" ? 'bg-blue-100' :
                              pkg.tag === "Popular" ? 'bg-purple-100' :
                              pkg.tag === "Power" ? 'bg-green-100' :
                              pkg.tag === "Enterprise" ? 'bg-indigo-100' :
                              'bg-yellow-100'
                            }`}>
                              {pkg.tag === "Starter" && <Sparkles className="text-blue-600" size={20} />}
                              {pkg.tag === "Popular" && <Zap className="text-purple-600" size={20} />}
                              {pkg.tag === "Power" && <TrendingUp className="text-green-600" size={20} />}
                              {pkg.tag === "Enterprise" && <Shield className="text-indigo-600" size={20} />}
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">{pkg.tag} Pack</h3>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-slate-900">{pkg.credits.toLocaleString()}</span>
                              <span className="text-slate-600 text-lg">Credits</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-indigo-600">${pkg.price.toFixed(2)}</span>
                              {pkg.discount > 0 && (
                                <>
                                  <span className="text-slate-400 line-through text-sm">${pkg.originalPrice.toFixed(2)}</span>
                                  <span className="text-xs text-slate-500">(${pkg.perCreditPrice}/credit)</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {pkg.features?.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                <Check size={14} className="text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <button
                          className={`w-full py-3 rounded-xl font-bold transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Select Package'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* How to Earn Credits Section */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Rocket className="text-indigo-600" size={24} />
                Earn Credits For Free
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {earnFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={feature.action}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                      <p className="text-slate-600 text-sm mb-4">{feature.description}</p>
                      <button className="text-indigo-600 text-sm font-medium flex items-center gap-1 group">
                        {feature.cta}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-32"
            >
              <h3 className="font-bold text-slate-900 text-xl mb-6">Order Summary</h3>
              
              {selectedPackage ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Package:</span>
                      <span className="font-bold text-slate-900">{selectedPackage.tag} Pack</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Credits:</span>
                      <span className="font-bold text-indigo-600">{selectedPackage.credits.toLocaleString()} CR</span>
                    </div>
                    {selectedPackage.discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Discount:</span>
                        <span className="font-bold text-green-600">{selectedPackage.discount}% OFF</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total:</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">${selectedPackage.price.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">One-time payment • No recurring fees</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-8">
                    <h4 className="font-bold text-slate-900 mb-4">Payment Method</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => {
                        const MethodIcon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${
                              paymentMethod === method.id
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${method.bg}`}>
                              <MethodIcon size={20} className={method.color} />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{method.name}</span>
                            {paymentMethod === method.id && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 disabled:cursor-not-allowed transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Complete Secure Payment
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  
                  <div className="mt-6 space-y-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-green-600" />
                      <span>256-bit SSL encryption • Your payment is secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck size={14} className="text-blue-600" />
                      <span>Instant delivery • Credits added immediately</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-yellow-600" />
                      <span>30-day money-back guarantee • No questions asked</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Sparkles size={32} className="mx-auto mb-3" />
                  <p>Select a package to continue</p>
                </div>
              )}
            </motion.div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="text-indigo-600" size={20} />
                Why Buy Credits?
              </h4>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Post unlimited job listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Hire top talent from our network</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unlock premium features and analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No subscription • Pay only for what you use</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && purchaseDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Check size={32} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 mb-6">
                  <span className="font-bold text-indigo-600">{purchaseDetails.credits.toLocaleString()} Credits</span> have been added to your wallet.
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                  <p className="text-slate-500 text-sm mb-2">Transaction Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-bold">${purchaseDetails.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">New Balance:</span>
                      <span className="font-bold text-green-600">{purchaseDetails.newBalance.toLocaleString()} CR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transaction ID:</span>
                      <span className="text-xs font-mono text-slate-500 truncate ml-2">{purchaseDetails.transactionId.slice(-8)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={goToWallet}
                    className="py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    View Wallet
                  </button>
                  <button
                    onClick={continueShopping}
                    className="py-3.5 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Buy More Credits
                  </button>
                  <button
                    onClick={() => navigate('/browse')}
                    className="py-3 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    Browse Jobs →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}