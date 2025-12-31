import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListing } from "../services/listingService";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Clock, ShieldCheck, MessageCircle } from "lucide-react";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListing(id);
        setListing(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Loading...</div>;
  if (!listing) return <div className="pt-32 text-center">Listing not found</div>;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-mutedText hover:text-slateText transition-colors mb-4">
            <ArrowLeft size={18} /> Back to Feed
          </button>

          <div className="bg-white p-8 rounded-3xl border border-border shadow-soft">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-indigo-50 text-primary text-xs font-bold uppercase tracking-wider rounded-lg">
                {listing.category}
              </span>
              <span className="text-sm text-mutedText flex items-center gap-1">
                <Clock size={14} /> Posted {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-heading font-bold text-slateText mb-6">{listing.title}</h1>
            
            <div className="prose prose-slate max-w-none text-mutedText">
              <p className="whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Action Sidebar */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
           className="md:col-span-1 space-y-6"
        >
          {/* Price Card */}
          <div className="bg-white p-6 rounded-3xl border border-border shadow-soft text-center">
            <p className="text-sm text-mutedText mb-2">Budget for this Request</p>
            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-slateText mb-6">
              <Zap size={28} className="text-secondary fill-secondary" /> {listing.credits}
            </div>
            
            <button className="w-full py-4 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 mb-3">
              Apply for Job
            </button>
            <button className="w-full py-4 bg-white border border-border text-slateText font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Message User
            </button>
          </div>

          {/* User Card */}
          <div className="bg-white p-6 rounded-3xl border border-border shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">
              {listing.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-mutedText">Posted by</p>
              <p className="font-bold text-slateText">@{listing.user.username}</p>
            </div>
            <ShieldCheck size={20} className="ml-auto text-secondary" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}