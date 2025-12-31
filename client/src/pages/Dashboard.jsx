import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../services/listingService";
import { motion } from "framer-motion";
import { Search, Zap, Loader, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getListings().then(setListings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-heading font-bold text-slate-900 mb-4">Find work. Earn credits.</h1>
           <p className="text-slate-500 max-w-xl mx-auto">Browse open opportunities from the community. Apply with your skills and start building your reputation.</p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-12">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
           <input 
             placeholder="Search by title or category..." 
             className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><Loader className="animate-spin text-indigo-600"/></div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-20 text-slate-400">No active listings found.</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
                 <motion.div 
                   key={item._id} 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                   className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                 >
                    <div>
                       <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">{item.category}</span>
                          <span className="flex items-center gap-1 font-bold text-slate-900"><Zap size={14} className="text-indigo-500 fill-indigo-500"/> {item.credits}</span>
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{item.title}</h3>
                       <p className="text-slate-500 text-sm line-clamp-3 mb-6">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">{item.user?.username?.[0]}</div>
                          <span className="text-xs font-medium text-slate-500">@{item.user?.username}</span>
                       </div>
                       <Link to={`/services/${item._id}`} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">View <ArrowRight size={14}/></Link>
                    </div>
                 </motion.div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}