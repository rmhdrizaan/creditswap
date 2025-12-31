import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Zap, TrendingUp, History, ArrowUpRight } from "lucide-react";

export default function Wallet() {
  const { user } = useAuth();

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-2xl">
        
        <h1 className="text-3xl font-heading font-bold text-slateText mb-8">My Wallet</h1>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden mb-8"
        >
           {/* Abstract Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
           
           <div className="relative z-10">
             <p className="text-slate-400 font-medium mb-2">Available Balance</p>
             <div className="flex items-center gap-3 text-6xl font-bold font-heading">
                <Zap size={48} className="text-yellow-400 fill-yellow-400" />
                {user?.credits || 0}
             </div>
             <p className="mt-6 text-sm text-slate-400 flex items-center gap-2">
                <TrendingUp size={16} className="text-secondary" /> Top 15% of earners this month
             </p>
           </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-10">
           <button className="p-4 bg-white border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors group">
              <div className="p-3 bg-indigo-50 text-primary rounded-full group-hover:scale-110 transition-transform"><ArrowUpRight size={20}/></div>
              <span className="font-bold text-slateText">Purchase Credits</span>
           </button>
           <button className="p-4 bg-white border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors group">
              <div className="p-3 bg-emerald-50 text-secondary rounded-full group-hover:scale-110 transition-transform"><History size={20}/></div>
              <span className="font-bold text-slateText">Transaction History</span>
           </button>
        </div>

        {/* Mock History */}
        <div className="bg-white rounded-3xl border border-border shadow-soft p-6">
           <h3 className="font-bold text-slateText mb-4">Recent Activity</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">+</div>
                    <div>
                       <p className="font-bold text-slateText">Welcome Bonus</p>
                       <p className="text-xs text-mutedText">System</p>
                    </div>
                 </div>
                 <span className="font-bold text-secondary">+50 CR</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}