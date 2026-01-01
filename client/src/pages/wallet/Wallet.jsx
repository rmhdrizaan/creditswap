import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions, getMockTransactions } from "../../services/transactionService";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import { motion } from "framer-motion";
import { 
  Zap, TrendingUp, TrendingDown, Clock, ArrowUpRight, 
  ArrowDownLeft, Wallet as WalletIcon, Plus, ArrowRight,
  RefreshCw, Download, BarChart3, Receipt, Sparkles,
  ExternalLink, Filter, Search, CreditCard, AlertCircle
} from "lucide-react";
import { toast } from 'react-hot-toast';

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.credits || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    jobCount: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const loadWalletData = async () => {
    try {
      setRefreshing(true);
      
      // 1. Fetch latest balance
      const profile = await getUserProfile(user._id);
      setBalance(profile.credits);

      // 2. Fetch transaction history
      let transactionResponse;
      try {
        transactionResponse = await getMyTransactions();
        console.log("Transaction API Response:", transactionResponse);
        
        // Handle different response formats
        const history = transactionResponse?.data || [];
        console.log("Processed transactions:", history);
        setTransactions(history);

        // 3. Calculate stats with safe checks
        const earned = history
          .filter(tx => {
            // Safe check for receiver ID
            const receiverId = tx.receiver?._id || tx.receiver;
            const isReceiver = receiverId === user._id;
            const isNotPurchase = tx.type !== 'credit_purchase';
            return isReceiver && isNotPurchase;
          })
          .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        const spent = history
          .filter(tx => {
            // Safe check for sender ID
            const senderId = tx.sender?._id || tx.sender;
            const isSender = senderId === user._id;
            const isNotPurchase = tx.type !== 'credit_purchase';
            return isSender && isNotPurchase;
          })
          .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        const jobCount = history.filter(tx => tx.listing || tx.type === 'payment').length;

        console.log("Calculated stats:", { earned, spent, jobCount });

        setStats({
          totalEarned: earned,
          totalSpent: spent,
          jobCount
        });

      } catch (transactionError) {
        console.error("Transaction API error, using mock data:", transactionError);
        
        // Fallback to mock data for development
        const mockResponse = getMockTransactions();
        const mockHistory = mockResponse.data.map(tx => ({
          ...tx,
          receiver: tx.receiver === 'user_id' ? { _id: user._id, username: 'You' } : { _id: tx.receiver, username: 'Worker' },
          sender: tx.sender === 'user_id' ? { _id: user._id, username: 'You' } : (tx.sender ? { _id: tx.sender, username: 'Client' } : null)
        }));
        
        setTransactions(mockHistory);
        
        // Calculate stats for mock data
        const earned = mockHistory
          .filter(tx => {
            const receiverId = tx.receiver?._id || tx.receiver;
            return receiverId === user._id && tx.type !== 'credit_purchase';
          })
          .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        const spent = mockHistory
          .filter(tx => {
            const senderId = tx.sender?._id || tx.sender;
            return senderId === user._id && tx.type !== 'credit_purchase';
          })
          .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        const jobCount = mockHistory.filter(tx => tx.listing).length;

        setStats({
          totalEarned: earned,
          totalSpent: spent,
          jobCount
        });

        toast(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span>Using demo data. Connect to backend for real transactions.</span>
          </div>,
          { duration: 5000 }
        );
      }

    } catch (error) {
      toast.error("Failed to load wallet data");
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadWalletData();
    }
  }, [user?._id]);

  const handleRefresh = () => {
    loadWalletData();
    toast.success("Wallet refreshed!");
  };

  const handleBuyCredits = () => {
    navigate('/buy-credits');
  };

  const handleExport = () => {
    toast.success("Export feature coming soon!");
  };

  const handleWithdraw = () => {
    toast(
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <span>Withdrawal feature launching soon!</span>
      </div>,
      { duration: 3000 }
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
      
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const getTransactionIcon = (tx) => {
    if (tx.type === 'credit_purchase') return <CreditCard size={16} />;
    if (tx.type === 'bonus') return <Sparkles size={16} />;
    
    const receiverId = tx.receiver?._id || tx.receiver;
    const isIncoming = receiverId === user._id;
    return isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />;
  };

  const getTransactionColor = (tx) => {
    if (tx.type === 'credit_purchase') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (tx.type === 'bonus') return 'bg-purple-100 text-purple-700 border-purple-200';
    
    const receiverId = tx.receiver?._id || tx.receiver;
    const isIncoming = receiverId === user._id;
    return isIncoming ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getTransactionLabel = (tx) => {
    switch(tx.type) {
      case 'credit_purchase': return 'Credit Purchase';
      case 'payment': return 'Payment';
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'refund': return 'Refund';
      case 'bonus': return 'Bonus';
      default: return 'Transaction';
    }
  };

  const getTransactionDescription = (tx) => {
    if (tx.type === 'credit_purchase') return 'Added credits to wallet';
    if (tx.type === 'bonus') return 'System bonus';
    
    const receiverId = tx.receiver?._id || tx.receiver;
    const senderId = tx.sender?._id || tx.sender;
    const isIncoming = receiverId === user._id;
    
    if (isIncoming) {
      const senderUsername = tx.sender?.username || 'User';
      return `Received from @${senderUsername}`;
    } else {
      const receiverUsername = tx.receiver?.username || 'User';
      return `Sent to @${receiverUsername}`;
    }
  };

  const getTransactionAmount = (tx) => {
    const receiverId = tx.receiver?._id || tx.receiver;
    const isIncoming = receiverId === user._id;
    const isPurchase = tx.type === 'credit_purchase';
    const isBonus = tx.type === 'bonus';
    
    const prefix = (isIncoming || isPurchase || isBonus) ? '+' : '-';
    return `${prefix}${tx.amount || 0}`;
  };

  const getTransactionAmountColor = (tx) => {
    const receiverId = tx.receiver?._id || tx.receiver;
    const isIncoming = receiverId === user._id;
    const isPurchase = tx.type === 'credit_purchase';
    const isBonus = tx.type === 'bonus';
    
    return (isIncoming || isPurchase || isBonus) ? 'text-green-600' : 'text-slate-900';
  };

  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter(tx => {
    // Filter by type
    if (filterType !== 'all' && tx.type !== filterType) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const description = (tx.description || '').toLowerCase();
      const listingTitle = (tx.listing?.title || '').toLowerCase();
      const type = (tx.type || '').toLowerCase();
      
      return description.includes(searchLower) || 
             listingTitle.includes(searchLower) || 
             type.includes(searchLower);
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/10 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
              <WalletIcon size={28} className="text-indigo-600"/>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Wallet</h1>
              <p className="text-slate-600">Manage your credits and transaction history</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/transactions')}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 shadow-sm"
            >
              <Receipt size={18} />
              All Transactions
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {refreshing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={160} />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-slate-300 text-sm font-medium mb-1">Available Credits</p>
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={48} className="text-yellow-400 fill-yellow-400"/>
                  <div>
                    <div className="text-5xl md:text-6xl font-bold">{balance.toLocaleString()}</div>
                    <p className="text-slate-400">≈ ${(balance * 0.1).toFixed(2)} USD</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleBuyCredits}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 hover:scale-[1.02]"
                >
                  <Plus size={18} />
                  Buy Credits
                </button>
                <button
                  onClick={handleWithdraw}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  Convert to Cash
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">+{stats.totalEarned.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-slate-400 text-xs">From completed jobs and bonuses</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                <TrendingDown size={24} className="text-slate-600" />
              </div>
            </div>
            <p className="text-slate-400 text-xs">On job postings and services</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.jobCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <BarChart3 size={24} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-slate-400 text-xs">Transactions with job listings</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Plus, label: "Top Up", color: "from-blue-500 to-indigo-600", action: handleBuyCredits },
            { icon: Download, label: "Export", color: "from-green-500 to-emerald-600", action: handleExport },
            { icon: ArrowRight, label: "Earn More", color: "from-purple-500 to-pink-600", action: () => navigate('/browse') },
            { icon: ExternalLink, label: "View All", color: "from-orange-500 to-red-600", action: () => navigate('/transactions') }
          ].map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.4 }}
              onClick={action.action}
              className={`bg-gradient-to-r ${action.color} rounded-2xl p-5 text-white cursor-pointer hover:opacity-95 transition-opacity flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform`}
            >
              <action.icon size={24} />
              <span className="font-bold">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Transaction History Header with Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Receipt size={24} className="text-slate-700" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
                  <p className="text-slate-500 text-sm">{filteredTransactions.length} transactions found</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-slate-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="credit_purchase">Credit Purchases</option>
                    <option value="payment">Payments</option>
                    <option value="bonus">Bonuses</option>
                    <option value="refund">Refunds</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction Content */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading your transactions...</p>
              <p className="text-slate-400 text-sm mt-1">This may take a moment</p>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No transactions yet</h3>
              <p className="text-slate-500 mb-6">Your transaction history will appear here once you start using credits</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBuyCredits}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Buy Credits to Get Started
                </button>
                <button
                  onClick={() => navigate('/browse')}
                  className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  Browse Jobs
                </button>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No matching transactions</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredTransactions.slice(0, 15).map((tx, index) => {
                const isPurchase = tx.type === 'credit_purchase';
                
                return (
                  <motion.div
                    key={tx.id || tx._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors border-l-4 border-transparent hover:border-indigo-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl border ${getTransactionColor(tx)} mt-1`}>
                          {getTransactionIcon(tx)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getTransactionColor(tx)}`}>
                              {getTransactionLabel(tx)}
                            </span>
                            <span className="text-slate-400 text-sm">{formatDate(tx.createdAt)}</span>
                            {tx.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {tx.status}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-slate-900">
                            {tx.listing?.title || tx.description || getTransactionLabel(tx)}
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            {getTransactionDescription(tx)}
                          </p>
                          {tx.metadata?.packageId && (
                            <p className="text-blue-600 text-xs mt-1">
                              Package #{tx.metadata.packageId}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getTransactionAmountColor(tx)}`}>
                          {getTransactionAmount(tx)} CR
                        </div>
                        <p className="text-slate-400 text-sm">
                          ≈ ${((tx.amount || 0) * 0.1).toFixed(2)}
                        </p>
                        {tx.listing?.credits && (
                          <p className="text-slate-500 text-xs mt-1">
                            Job: {tx.listing.credits} credits
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {filteredTransactions.length > 15 && (
                <div className="p-6 text-center border-t border-slate-100">
                  <button
                    onClick={() => navigate('/transactions')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-2 mx-auto"
                  >
                    View {filteredTransactions.length - 15} more transactions
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Sparkles className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Need help with your wallet?</h3>
              <p className="text-slate-600 mb-4">
                If you're experiencing issues with transactions or need assistance, 
                here are some helpful resources:
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/help')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Help Center
                </button>
                <button
                  onClick={() => toast.success("Contact support feature coming soon!")}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => window.open('https://example.com/faq', '_blank')}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  View FAQ
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}