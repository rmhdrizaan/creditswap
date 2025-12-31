import { useEffect, useState } from "react";
import { getMyTransactions } from "../../services/transactionService";
import { useAuth } from "../../context/AuthContext"; // To get live balance
import { getUserProfile } from "../../services/userService"; // To refresh balance
import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon } from "lucide-react";

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(user?.credits || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        // 1. Fetch latest balance (source of truth)
        const profile = await getUserProfile(user._id);
        setBalance(profile.credits);

        // 2. Fetch history
        const history = await getMyTransactions();
        setTransactions(history);
      } catch (error) {
        console.error("Failed to load wallet", error);
      } finally {
        setLoading(false);
      }
    };
    loadWalletData();
  }, [user._id]);

  // Calculate stats
  const totalEarned = transactions
    .filter(t => t.receiver._id === user._id)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalSpent = transactions
    .filter(t => t.sender._id === user._id)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <WalletIcon size={24} className="text-slate-800"/>
           </div>
           <h1 className="text-3xl font-heading font-bold text-slate-900">My Wallet</h1>
        </div>

        {/* --- 1. Balance Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {/* Main Balance */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Zap size={120} />
              </div>
              <div className="relative z-10">
                 <p className="text-slate-400 font-medium mb-1">Available Credits</p>
                 <div className="flex items-center gap-2 text-6xl font-bold font-heading mb-4">
                    <Zap size={40} className="text-yellow-400 fill-yellow-400"/>
                    {balance}
                 </div>
                 <div className="flex gap-4">
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/30">
                       Buy Credits
                    </button>
                    <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-sm transition-colors">
                       Withdraw
                    </button>
                 </div>
              </div>
           </motion.div>

           {/* Quick Stats */}
           <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                 <div>
                    <p className="text-slate-500 text-sm font-medium">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">+{totalEarned}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <TrendingUp size={20} />
                 </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                 <div>
                    <p className="text-slate-500 text-sm font-medium">Total Spent</p>
                    <p className="text-2xl font-bold text-slate-900">{totalSpent}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                    <TrendingDown size={20} />
                 </div>
              </motion.div>
           </div>
        </div>

        {/* --- 2. Transaction History --- */}
        <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Recent Transactions</h2>
        
        {loading ? (
           <div className="text-center py-10 text-slate-400">Loading history...</div>
        ) : transactions.length === 0 ? (
           <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center">
              <Clock className="mx-auto text-slate-300 mb-3" size={32}/>
              <p className="text-slate-500 font-medium">No transactions yet</p>
           </div>
        ) : (
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold">
                       <tr>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Job / Details</th>
                          <th className="px-6 py-4">From/To</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {transactions.map((tx) => {
                          const isIncoming = tx.receiver._id === user._id;
                          return (
                             <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                   {isIncoming ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                         <ArrowDownLeft size={12}/> Received
                                      </span>
                                   ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">
                                         <ArrowUpRight size={12}/> Sent
                                      </span>
                                   )}
                                </td>
                                <td className="px-6 py-4">
                                   <p className="font-bold text-slate-900">{tx.listing?.title || "Unknown Job"}</p>
                                   <p className="text-xs text-slate-400">ID: {tx._id.slice(-6)}</p>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      {isIncoming ? (
                                         <>
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                               {tx.sender.username[0]}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">@{tx.sender.username}</span>
                                         </>
                                      ) : (
                                         <>
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                                               {tx.receiver.username[0]}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">@{tx.receiver.username}</span>
                                         </>
                                      )}
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                   {new Date(tx.createdAt).toLocaleDateString()} <span className="text-slate-300">|</span> {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold text-lg ${isIncoming ? 'text-green-600' : 'text-slate-900'}`}>
                                   {isIncoming ? '+' : '-'}{tx.amount} CR
                                </td>
                             </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}