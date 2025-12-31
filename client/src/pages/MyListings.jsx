import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyListings } from "../services/listingService";
import { motion } from "framer-motion";
import { Plus, Zap } from "lucide-react";

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const data = await getMyListings();
        setListings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-slateText">
            My Listings
          </h1>

          <Link to="/post-job">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primaryHover transition-all">
              <Plus size={18} /> New Post
            </button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <h3 className="text-xl font-bold text-slate-400">
              You haven't posted anything yet.
            </h3>
            <p className="text-mutedText mt-2 mb-6">
              Start trading skills to earn credits.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {listings.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-border shadow-soft flex flex-col md:flex-row items-center justify-between gap-6"
              >
                {/* Left */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs text-mutedText">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slateText">
                    {item.title}
                  </h3>
                </div>

                {/* Right */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 font-bold text-slateText bg-slate-50 px-3 py-1 rounded-lg">
                    <Zap size={16} className="text-secondary fill-secondary" />
                    {item.credits}
                  </div>

                  {/* MANAGE BUTTON */}
                  <Link to={`/my-listings/${item._id}/manage`}>
                    <button className="px-4 py-2 bg-slate-100 text-slateText text-sm font-bold rounded-lg hover:bg-slate-200 transition">
                      Manage
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
