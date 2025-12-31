import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../services/listingService";
import { motion } from "framer-motion";
import { Search, Plus, Zap, Filter, Loader } from "lucide-react";

const categoryColors = {
  Development: "bg-blue-100 text-blue-700",
  Design: "bg-pink-100 text-pink-700",
  Marketing: "bg-purple-100 text-purple-700",
  Writing: "bg-yellow-100 text-yellow-700",
  Other: "bg-slate-100 text-slate-700",
};

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListings();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-28 pb-10 px-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-slateText">Marketplace</h1>
            <p className="text-mutedText mt-1">Found <span className="font-bold text-primary">{listings.length}</span> active opportunities</p>
          </div>
          <Link to="/post-job">
            <button className="flex items-center gap-2 px-6 py-3 bg-slateText text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all transform hover:-translate-y-0.5">
              <Plus size={18} /> Post Request
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search skills, titles..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-3.5 bg-white border border-border rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium">
             <Filter size={18} /> Filters
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-primary" size={40} />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
             <h3 className="text-xl font-bold text-slate-400">No listings found</h3>
             <p className="text-mutedText mt-2">Try adjusting your search or post a new job.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredListings.map((listing) => (
              <motion.div 
                key={listing._id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl border border-border shadow-soft hover:shadow-card transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${categoryColors[listing.category] || categoryColors.Other}`}>
                      {listing.category}
                    </span>
                    <span className="font-heading font-bold text-slateText flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <Zap size={14} className="text-secondary fill-secondary"/> {listing.credits}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slateText mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {listing.title}
                  </h3>
                  
                  <p className="text-mutedText text-sm mb-6 line-clamp-3">
                    {listing.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-primary text-xs font-bold border border-indigo-100">
                       {listing.user?.username?.charAt(0).toUpperCase() || "U"}
                     </div>
                     <span className="text-xs font-medium text-slate-500">@{listing.user?.username || "user"}</span>
                  </div>
                  <span className="text-xs font-bold text-primary hover:underline">View Details</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}