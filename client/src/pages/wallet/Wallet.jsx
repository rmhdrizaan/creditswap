import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions } from "../../services/transactionService";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import { motion } from "framer-motion";
import { 
  Zap, TrendingUp, TrendingDown, Clock, ArrowUpRight, 
  ArrowDownLeft, Wallet as WalletIcon, Plus, ArrowRight,
  RefreshCw, Download, BarChart3, Receipt, Sparkles
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

  const loadWalletData = async () => {
    try {
      setRefreshing(true);
      
      // 1. Fetch latest balance
      const profile = await getUserProfile(user._id);
      setBalance(profile.credits);

      // 2. Fetch transaction history
      const history = await getMyTransactions();
      setTransactions(history);

      // 3. Calculate stats
      const earned = history
        .filter(t => t.receiver._id === user._id && t.type !== 'credit_purchase')
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      const spent = history
        .filter(t => t.sender._id === user._id && t.type !== 'credit_purchase')
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      const jobCount = history.filter(t => t.listing).length;

      setStats({
        totalEarned: earned,
        totalSpent: spent,
        jobCount
      });

    } catch (error) {
      toast.error("Failed to load wallet data");
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [user._id]);

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
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getTransactionIcon = (tx) => {
    const isIncoming = tx.receiver._id === user._id;
    if (tx.type === 'credit_purchase') return <Plus size={16} />;
    return isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />;
  };

  const getTransactionColor = (tx) => {
    const isIncoming = tx.receiver._id === user._id;
    if (tx.type === 'credit_purchase') return 'bg-blue-100 text-blue-700 border-blue-200';
    return isIncoming ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200';
  };

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
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Plus, label: "Top Up", color: "from-blue-500 to-indigo-600", action: handleBuyCredits },
            { icon: Download, label: "Export", color: "from-green-500 to-emerald-600", action: handleExport },
            { icon: Receipt, label: "Invoices", color: "from-purple-500 to-pink-600", action: () => navigate('/invoices') },
            { icon: ArrowRight, label: "Earn More", color: "from-orange-500 to-red-600", action: () => navigate('/browse') }
          ].map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.4 }}
              onClick={action.action}
              className={`bg-gradient-to-r ${action.color} rounded-2xl p-5 text-white cursor-pointer hover:opacity-95 transition-opacity flex flex-col items-center justify-center gap-3`}
            >
              <action.icon size={24} />
              <span className="font-bold">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt size={24} className="text-slate-700" />
                <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
              </div>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-slate-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No transactions yet</p>
              <p className="text-slate-400 text-sm mt-1">Your transaction history will appear here</p>
              <button
                onClick={handleBuyCredits}
                className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Make Your First Purchase
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 10).map((tx) => {
                const isIncoming = tx.receiver._id === user._id;
                const isPurchase = tx.type === 'credit_purchase';
                
                return (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${getTransactionColor(tx)}`}>
                          {getTransactionIcon(tx)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getTransactionColor(tx)}`}>
                              {isPurchase ? 'Purchase' : isIncoming ? 'Received' : 'Sent'}
                            </span>
                            <span className="text-slate-400 text-sm">{formatDate(tx.createdAt)}</span>
                          </div>
                          <p className="font-medium text-slate-900">
                            {tx.listing?.title || (isPurchase ? 'Credit Purchase' : 'Credit Transfer')}
                          </p>
                          <p className="text-slate-500 text-sm">
                            {isPurchase ? 'System' : isIncoming ? `From: @${tx.sender?.username}` : `To: @${tx.receiver?.username}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isIncoming || isPurchase ? 'text-green-600' : 'text-slate-900'}`}>
                          {(isIncoming || isPurchase ? '+' : '-')}{tx.amount} CR
                        </p>
                        <p className="text-slate-400 text-sm">
                          ≈ ${(tx.amount * 0.1).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}